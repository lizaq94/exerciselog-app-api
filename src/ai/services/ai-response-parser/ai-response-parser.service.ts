import { BadRequestException, Injectable } from '@nestjs/common';
import { LoggerService } from '../../../logger/logger.service';
import { AiResponseDto } from '../../dto/ai-response';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';

@Injectable()
export class AiResponseParserService {
  constructor(private readonly logger: LoggerService) {}

  async parse(rawJson: string): Promise<AiResponseDto> {
    this.logger.log('Parsing AI response...', AiResponseParserService.name);

    if (!rawJson || rawJson.trim() === '') {
      throw new BadRequestException(
        'AI returned empty response. Please try again.',
      );
    }

    try {
      const parsedJson = JSON.parse(rawJson);
      this.logger.log('JSON parsed successfully', AiResponseParserService.name);

      const sanitizedData = this.sanitizeResponse(parsedJson);
      const result = await this.validateStructure(sanitizedData);

      this.logger.log(
        'AI response validated successfully',
        AiResponseParserService.name,
      );

      return result;
    } catch (error) {
      this.logger.error(
        'Parsing failed: ' + error,
        AiResponseParserService.name,
      );

      if (error instanceof SyntaxError) {
        throw new BadRequestException(
          'AI returned invalid JSON. Please try again.',
        );
      }

      throw error;
    }
  }

  private async validateStructure(plainObject: any): Promise<AiResponseDto> {
    const aiResponseDto = plainToClass(AiResponseDto, plainObject, {
      enableImplicitConversion: true,
    });

    const errors = await validate(aiResponseDto, {
      whitelist: true,
    });

    if (errors.length > 0) {
      const validationErrors = errors
        .map((error) => {
          return Object.values(error.constraints || {});
        })
        .flat();

      throw new BadRequestException({
        message: 'AI response validation failed',
        errors: validationErrors,
      });
    }

    return aiResponseDto;
  }

  private sanitizeResponse(data: any): any {
    return data;
  }
}
