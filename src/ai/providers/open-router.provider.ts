import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { GenerateWorkoutDto } from '../dto/generate-workout.dto';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class OpenRouterProvider {
  constructor(private readonly httpService: HttpService) {}

  public async generateWorkout(generateWorkoutDto: GenerateWorkoutDto) {
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
          content:
            "If you built the world's tallest skyscraper, what would you name it?",
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

      console.log('Kamil | choice: ', choice);

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
