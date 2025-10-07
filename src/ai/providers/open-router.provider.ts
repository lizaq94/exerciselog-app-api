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

@Injectable()
export class OpenRouterProvider {
  private promptTemplate: Handlebars.TemplateDelegate;

  constructor(private readonly httpService: HttpService) {
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
      console.log('Szablon promptu został pomyślnie załadowany.');
    } catch (error) {
      console.error('Błąd podczas ładowania szablonu promptu:', error);
      throw new InternalServerErrorException(
        'Nie można załadować szablonu promptu.',
      );
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
