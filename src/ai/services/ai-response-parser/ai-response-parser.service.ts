import { BadRequestException, Injectable } from '@nestjs/common';
import { LoggerService } from '../../../logger/logger.service';
import { AiResponseDto } from '../../dto/ai-response';
import { plainToClass } from 'class-transformer';
import { validate } from 'class-validator';
import {
  AI_PARSER_ERROR_MESSAGES,
  AI_PARSER_LOG_MESSAGES,
} from '../constants/ai-response-parser.constants';

@Injectable()
export class AiResponseParserService {
  constructor(private readonly logger: LoggerService) {}

  async parse(rawJson: string): Promise<AiResponseDto> {
    this.logger.log(
      AI_PARSER_LOG_MESSAGES.PARSING_START,
      AiResponseParserService.name,
    );

    if (!rawJson || rawJson.trim() === '') {
      throw new BadRequestException(AI_PARSER_ERROR_MESSAGES.EMPTY_RESPONSE);
    }

    try {
      const parsedJson = JSON.parse(rawJson);
      this.logger.log(
        AI_PARSER_LOG_MESSAGES.JSON_PARSED,
        AiResponseParserService.name,
      );

      const sanitizedData = this.sanitizeResponse(parsedJson);
      const result = await this.validateStructure(sanitizedData);

      this.logger.log(
        AI_PARSER_LOG_MESSAGES.VALIDATION_SUCCESS,
        AiResponseParserService.name,
      );

      return result;
    } catch (error) {
      this.logger.error(
        'Parsing failed: ' + error,
        AiResponseParserService.name,
      );

      if (error instanceof SyntaxError) {
        throw new BadRequestException(AI_PARSER_ERROR_MESSAGES.INVALID_JSON);
      }

      throw error;
    }
  }

  private async validateStructure(plainObject: any): Promise<AiResponseDto> {
    const aiResponseDto = plainToClass(AiResponseDto, plainObject);

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
        message: AI_PARSER_ERROR_MESSAGES.VALIDATION_FAILED,
        errors: validationErrors,
      });
    }

    return aiResponseDto;
  }

  private sanitizeResponse(data: any): any {
    return data;
  }
}
