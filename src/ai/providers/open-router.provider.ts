import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { GenerateWorkoutDto } from '../dto/generate-workout.dto';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import * as Handlebars from 'handlebars';
import * as fs from 'fs/promises';
import * as path from 'path';
import { AiResponseParserService } from '../services/ai-response-parser/ai-response-parser.service';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class OpenRouterProvider {
  private promptTemplate: Handlebars.TemplateDelegate;

  constructor(
    private readonly httpService: HttpService,
    private readonly aiResponseParserService: AiResponseParserService,
    private readonly logger: LoggerService,
  ) {
    this.loadPromptTemplate();
  }

  private async loadPromptTemplate() {
    try {
      const templatePath = path.join(
        process.cwd(),
        'src',
        'ai',
        'prompts',
        'generate-workout.prompt.hbs',
      );
      const templateString = await fs.readFile(templatePath, 'utf-8');
      this.promptTemplate = Handlebars.compile(templateString);
      this.logger.log(
        'Prompt template loaded successfully',
        OpenRouterProvider.name,
      );
    } catch (error) {
      this.logger.error(
        `Error loading prompt template: ${error}`,
        OpenRouterProvider.name,
      );
      throw new InternalServerErrorException('Failed to load prompt template.');
    }
  }

  public async generateWorkout(generateWorkoutDto: GenerateWorkoutDto) {
    const finalPrompt = this.promptTemplate({
      ...generateWorkoutDto,
    });

    const url = `${process.env.OPEN_ROUTER_API_URL}/chat/completions`;
    const headers = {
      Authorization: `Bearer ${process.env.OPEN_ROUTER_API_KEY}`,
      'Content-Type': 'application/json',
    };
    const payload = {
      model: 'openai/gpt-4o-mini',
      messages: [
        {
          role: 'user',
          content: finalPrompt,
        },
      ],
    };

    try {
      const response$ = this.httpService.post(url, payload, { headers });
      const response = await lastValueFrom(response$);

      const choice = response.data.choices[0]?.message?.content;

      if (!choice) {
        throw new HttpException(
          'OpenRouter API returned empty response - no workout content generated',
          HttpStatus.BAD_GATEWAY,
        );
      }

      const responseTest = await this.aiResponseParserService.parse(choice);

      console.log('Kamil | response: ', responseTest);

      return choice;
    } catch (err) {
      if (err.response?.status === 401) {
        throw new HttpException(
          'OpenRouter API authentication failed - check your API key',
          HttpStatus.UNAUTHORIZED,
        );
      }

      if (err.response?.status === 429) {
        throw new HttpException(
          'OpenRouter API rate limit exceeded - please try again later',
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      if (err.response?.status === 400) {
        throw new HttpException(
          'Invalid request to OpenRouter API - check payload format',
          HttpStatus.BAD_REQUEST,
        );
      }

      if (err.code === 'ENOTFOUND' || err.code === 'ECONNREFUSED') {
        throw new HttpException(
          'Cannot connect to OpenRouter API - network error',
          HttpStatus.BAD_GATEWAY,
        );
      }

      throw new HttpException(
        `OpenRouter API error: ${err.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
