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
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class OpenRouterProvider {
  private promptTemplate: Handlebars.TemplateDelegate;

  constructor(
    private readonly httpService: HttpService,
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

  public async generateWorkout(
    generateWorkoutDto: GenerateWorkoutDto,
  ): Promise<string> {
    const finalPrompt = this.promptTemplate({
      ...generateWorkoutDto,
    });

    this.logger.log(
      'Sending request to OpenRouter API',
      OpenRouterProvider.name,
    );

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
        this.logger.error(
          'OpenRouter API returned empty response',
          OpenRouterProvider.name,
        );
        throw new HttpException(
          'OpenRouter API returned empty response - no workout content generated',
          HttpStatus.BAD_GATEWAY,
        );
      }

      this.logger.log(
        `Received response from OpenRouter API (length: ${choice.length} chars)`,
        OpenRouterProvider.name,
      );

      return choice;
    } catch (err) {
      this.logger.error(
        `OpenRouter API call failed: ${err.message}`,
        OpenRouterProvider.name,
      );
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
