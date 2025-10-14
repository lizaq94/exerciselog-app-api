import { Test, TestingModule } from '@nestjs/testing';
import { AiResponseParserService } from './ai-response-parser.service';
import { LoggerService } from '../../../logger/logger.service';
import { BadRequestException } from '@nestjs/common';
import { RAW_AI_RESPONSES } from '../__mocks__/ai-responses.mock';
import {
  AI_PARSER_ERROR_MESSAGES,
  AI_PARSER_LOG_MESSAGES,
} from '../constants/ai-response-parser.constants';

describe('AiResponseParserService', () => {
  let service: AiResponseParserService;
  let mockLoggerService: jest.Mocked<LoggerService>;

  const mockLoggerServiceFactory = () => ({
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiResponseParserService,
        {
          provide: LoggerService,
          useFactory: mockLoggerServiceFactory,
        },
      ],
    }).compile();

    service = module.get<AiResponseParserService>(AiResponseParserService);
    mockLoggerService = module.get(LoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('parse', () => {
    describe('Happy Path - Valid JSON', () => {
      it('should successfully parse valid AI response with one training plan', async () => {
        const result = await service.parse(RAW_AI_RESPONSES.singlePlan);

        expect(result).toBeDefined();
        expect(result.trainingPlans).toBeDefined();
        expect(result.trainingPlans).toHaveLength(1);

        const plan = result.trainingPlans[0];
        expect(plan.name).toBe('Push Day - Upper Body Strength');
        expect(plan.notes).toBeDefined();
        expect(plan.duration).toBe(60);
        expect(plan.exercises).toHaveLength(5);

        const firstExercise = plan.exercises[0];
        expect(firstExercise.order).toBe(1);
        expect(firstExercise.name).toBe('Dynamic Warmup');
        expect(firstExercise.type).toBe('warmup');
        expect(firstExercise.sets).toHaveLength(1);

        const firstSet = firstExercise.sets[0];
        expect(firstSet.order).toBe(1);
        expect(firstSet.repetitions).toBe(0);
        expect(firstSet.weight).toBe(0);
        expect(firstSet.durationInSeconds).toBe(300);
        expect(firstSet.restAfterSetInSeconds).toBe(0);

        expect(mockLoggerService.log).toHaveBeenCalledWith(
          AI_PARSER_LOG_MESSAGES.PARSING_START,
          AiResponseParserService.name,
        );
        expect(mockLoggerService.log).toHaveBeenCalledWith(
          AI_PARSER_LOG_MESSAGES.JSON_PARSED,
          AiResponseParserService.name,
        );
        expect(mockLoggerService.log).toHaveBeenCalledWith(
          AI_PARSER_LOG_MESSAGES.VALIDATION_SUCCESS,
          AiResponseParserService.name,
        );
      });

      it('should successfully parse valid AI response with multiple training plans', async () => {
        const result = await service.parse(RAW_AI_RESPONSES.pushPullLegs);

        expect(result).toBeDefined();
        expect(result.trainingPlans).toBeDefined();
        expect(result.trainingPlans).toHaveLength(3);

        expect(result.trainingPlans[0].name).toBe('Training A - Push');
        expect(result.trainingPlans[1].name).toBe('Training B - Pull');
        expect(result.trainingPlans[2].name).toBe('Training C - Legs');

        result.trainingPlans.forEach((plan) => {
          expect(plan.name).toBeDefined();
          expect(plan.notes).toBeDefined();
          expect(plan.duration).toBeDefined();
          expect(plan.exercises).toBeDefined();
          expect(plan.exercises.length).toBeGreaterThan(0);
        });
      });
    });

    describe('Empty or Invalid Input', () => {
      it('should throw BadRequestException when rawJson is empty string', async () => {
        await expect(service.parse('')).rejects.toThrow(
          new BadRequestException(AI_PARSER_ERROR_MESSAGES.EMPTY_RESPONSE),
        );

        expect(mockLoggerService.log).toHaveBeenCalledWith(
          AI_PARSER_LOG_MESSAGES.PARSING_START,
          AiResponseParserService.name,
        );
      });

      it('should throw BadRequestException when rawJson is only whitespace', async () => {
        await expect(service.parse('     ')).rejects.toThrow(
          new BadRequestException(AI_PARSER_ERROR_MESSAGES.EMPTY_RESPONSE),
        );
      });

      it('should throw BadRequestException when rawJson is null', async () => {
        await expect(service.parse(null as any)).rejects.toThrow(
          new BadRequestException(AI_PARSER_ERROR_MESSAGES.EMPTY_RESPONSE),
        );
      });

      it('should throw BadRequestException when rawJson is undefined', async () => {
        await expect(service.parse(undefined as any)).rejects.toThrow(
          new BadRequestException(AI_PARSER_ERROR_MESSAGES.EMPTY_RESPONSE),
        );
      });
    });

    describe('JSON Syntax Errors', () => {
      it('should throw BadRequestException for malformed JSON', async () => {
        const malformedJson = '{"trainingPlans": [invalid json}';

        await expect(service.parse(malformedJson)).rejects.toThrow(
          new BadRequestException(AI_PARSER_ERROR_MESSAGES.INVALID_JSON),
        );

        expect(mockLoggerService.error).toHaveBeenCalledWith(
          expect.stringContaining('Parsing failed:'),
          AiResponseParserService.name,
        );
      });
    });

    describe('Validation Errors - Missing Required Fields', () => {
      it('should throw BadRequestException when trainingPlans array is missing', async () => {
        const jsonWithoutTrainingPlans = JSON.stringify({
          someOtherField: 'value',
        });

        const error = await service
          .parse(jsonWithoutTrainingPlans)
          .catch((e) => e);

        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.response.message).toBe(
          AI_PARSER_ERROR_MESSAGES.VALIDATION_FAILED,
        );
        expect(error.response.errors).toBeDefined();
      });

      it('should throw BadRequestException when trainingPlans array is empty', async () => {
        const jsonWithEmptyArray = JSON.stringify({
          trainingPlans: [],
        });

        const error = await service.parse(jsonWithEmptyArray).catch((e) => e);

        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.response.errors).toContain(
          'AI must return at least one training plan',
        );
      });

      it('should throw BadRequestException when training plan name is missing', async () => {
        const jsonWithoutName = JSON.stringify({
          trainingPlans: [
            {
              notes: 'Some notes',
              duration: 60,
              exercises: [],
            },
          ],
        });

        await expect(service.parse(jsonWithoutName)).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should throw BadRequestException when training plan notes are missing', async () => {
        const jsonWithoutNotes = JSON.stringify({
          trainingPlans: [
            {
              name: 'Test Plan',
              duration: 60,
              exercises: [],
            },
          ],
        });

        await expect(service.parse(jsonWithoutNotes)).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should throw BadRequestException when training plan duration is missing', async () => {
        const jsonWithoutDuration = JSON.stringify({
          trainingPlans: [
            {
              name: 'Test Plan',
              notes: 'Some notes',
              exercises: [],
            },
          ],
        });

        await expect(service.parse(jsonWithoutDuration)).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should throw BadRequestException when exercises array is missing', async () => {
        const jsonWithoutExercises = JSON.stringify({
          trainingPlans: [
            {
              name: 'Test Plan',
              notes: 'Some notes',
              duration: 60,
            },
          ],
        });

        await expect(service.parse(jsonWithoutExercises)).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should throw BadRequestException when exercise name is missing', async () => {
        const jsonWithoutExerciseName = JSON.stringify({
          trainingPlans: [
            {
              name: 'Test Plan',
              notes: 'Some notes',
              duration: 60,
              exercises: [
                {
                  order: 1,
                  type: 'main',
                  notes: 'Exercise notes',
                  sets: [],
                },
              ],
            },
          ],
        });

        await expect(service.parse(jsonWithoutExerciseName)).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should throw BadRequestException when set order is missing', async () => {
        const jsonWithoutSetOrder = JSON.stringify({
          trainingPlans: [
            {
              name: 'Test Plan',
              notes: 'Some notes',
              duration: 60,
              exercises: [
                {
                  order: 1,
                  name: 'Bench Press',
                  type: 'main',
                  notes: 'Exercise notes',
                  sets: [
                    {
                      repetitions: 10,
                      weight: 60,
                      durationInSeconds: 0,
                      restAfterSetInSeconds: 90,
                    },
                  ],
                },
              ],
            },
          ],
        });

        await expect(service.parse(jsonWithoutSetOrder)).rejects.toThrow(
          BadRequestException,
        );
      });
    });

    describe('Validation Errors - Invalid Values', () => {
      it('should throw BadRequestException when duration is less than minimum (20)', async () => {
        const jsonWithInvalidDuration = JSON.stringify({
          trainingPlans: [
            {
              name: 'Test Plan',
              notes: 'Some notes',
              duration: 15,
              exercises: [],
            },
          ],
        });

        await expect(service.parse(jsonWithInvalidDuration)).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should throw BadRequestException when exercise order is less than 1', async () => {
        const jsonWithInvalidExerciseOrder = JSON.stringify({
          trainingPlans: [
            {
              name: 'Test Plan',
              notes: 'Some notes',
              duration: 60,
              exercises: [
                {
                  order: 0,
                  name: 'Bench Press',
                  type: 'main',
                  notes: 'Exercise notes',
                  sets: [],
                },
              ],
            },
          ],
        });

        await expect(
          service.parse(jsonWithInvalidExerciseOrder),
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw BadRequestException when exercise type is invalid', async () => {
        const jsonWithInvalidExerciseType = JSON.stringify({
          trainingPlans: [
            {
              name: 'Test Plan',
              notes: 'Some notes',
              duration: 60,
              exercises: [
                {
                  order: 1,
                  name: 'Bench Press',
                  type: 'wrong type',
                  notes: 'Exercise notes',
                  sets: [],
                },
              ],
            },
          ],
        });

        await expect(
          service.parse(jsonWithInvalidExerciseType),
        ).rejects.toThrow(BadRequestException);
      });

      it('should throw BadRequestException when set repetitions is negative', async () => {
        const jsonWithInvalidSetRepetitions = JSON.stringify({
          trainingPlans: [
            {
              name: 'Test Plan',
              notes: 'Some notes',
              duration: 60,
              exercises: [
                {
                  order: 1,
                  name: 'Bench Press',
                  type: 'main',
                  notes: 'Exercise notes',
                  sets: [
                    {
                      order: 1,
                      repetitions: -1,
                      weight: 60,
                      durationInSeconds: 0,
                      restAfterSetInSeconds: 90,
                    },
                  ],
                },
              ],
            },
          ],
        });

        await expect(
          service.parse(jsonWithInvalidSetRepetitions),
        ).rejects.toThrow(BadRequestException);
      });
    });

    describe('Validation Errors - Wrong Data Types', () => {
      it('should throw BadRequestException when name is not a string', async () => {
        const jsonWithNumberName = JSON.stringify({
          trainingPlans: [
            {
              name: 12345,
              notes: 'Some notes',
              duration: 60,
              exercises: [],
            },
          ],
        });

        await expect(service.parse(jsonWithNumberName)).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should throw BadRequestException when duration is not a number', async () => {
        const jsonWithStringDuration = JSON.stringify({
          trainingPlans: [
            {
              name: 'Test Plan',
              notes: 'Some notes',
              duration: '60',
              exercises: [],
            },
          ],
        });

        await expect(service.parse(jsonWithStringDuration)).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should throw BadRequestException when exercises is not an array', async () => {
        const jsonWithNonArrayExercises = JSON.stringify({
          trainingPlans: [
            {
              name: 'Test Plan',
              notes: 'Some notes',
              duration: 60,
              exercises: 'not an array',
            },
          ],
        });

        await expect(service.parse(jsonWithNonArrayExercises)).rejects.toThrow(
          BadRequestException,
        );
      });

      it('should throw BadRequestException when trainingPlans is not an array', async () => {
        const jsonWithNonArrayPlans = JSON.stringify({
          trainingPlans: {
            name: 'Single Plan',
          },
        });

        await expect(service.parse(jsonWithNonArrayPlans)).rejects.toThrow(
          BadRequestException,
        );
      });
    });

    describe('Edge Cases', () => {
      it('should handle response with minimum valid duration (20 minutes)', async () => {
        const result = await service.parse(RAW_AI_RESPONSES.minimal);

        expect(result).toBeDefined();
        expect(result.trainingPlans).toHaveLength(1);
        expect(result.trainingPlans[0].duration).toBe(20);
      });

      it('should handle response with zero weight (bodyweight exercises)', async () => {
        const result = await service.parse(RAW_AI_RESPONSES.bodyweight);

        expect(result).toBeDefined();
        const plan = result.trainingPlans[0];
        const exercise = plan.exercises.find((ex) => ex.type === 'main');

        expect(exercise).toBeDefined();
        expect(exercise?.sets[0].weight).toBe(0);
      });

      it('should handle response with zero repetitions (timed exercises)', async () => {
        const result = await service.parse(RAW_AI_RESPONSES.singlePlan);

        const plan = result.trainingPlans[0];
        const warmupExercise = plan.exercises.find(
          (ex) => ex.type === 'warmup',
        );

        expect(warmupExercise).toBeDefined();
        expect(warmupExercise?.sets[0].repetitions).toBe(0);
        expect(warmupExercise?.sets[0].durationInSeconds).toBeGreaterThan(0);
      });

      it('should handle response with very long workout duration', async () => {
        const jsonWithLongDuration = JSON.stringify({
          trainingPlans: [
            {
              name: 'Marathon Training',
              notes: 'Very long workout session',
              duration: 180,
              exercises: [
                {
                  order: 1,
                  name: 'Running',
                  type: 'main',
                  notes: 'Long distance run',
                  sets: [
                    {
                      order: 1,
                      repetitions: 0,
                      weight: 0,
                      durationInSeconds: 10800,
                      restAfterSetInSeconds: 0,
                    },
                  ],
                },
              ],
            },
          ],
        });

        const result = await service.parse(jsonWithLongDuration);

        expect(result).toBeDefined();
        expect(result.trainingPlans[0].duration).toBe(180);
        expect(
          result.trainingPlans[0].exercises[0].sets[0].durationInSeconds,
        ).toBe(10800);
      });
    });

    describe('Error Logging', () => {
      it('should log errors when validation fails', async () => {
        const jsonWithValidationError = JSON.stringify({
          trainingPlans: [
            {
              name: 'Test Plan',
              notes: 'Some notes',
              duration: 10,
              exercises: [],
            },
          ],
        });

        try {
          await service.parse(jsonWithValidationError);
          fail('Should have thrown BadRequestException');
        } catch (error) {
          expect(error).toBeInstanceOf(BadRequestException);
          expect(mockLoggerService.error).toHaveBeenCalledWith(
            expect.stringContaining('Parsing failed:'),
            AiResponseParserService.name,
          );
        }
      });

      it('should rethrow non-SyntaxError exceptions', async () => {
        jest.spyOn(JSON, 'parse').mockImplementationOnce(() => {
          throw new TypeError('Unexpected error');
        });

        try {
          await service.parse('{"test": "data"}');
          fail('Should have thrown TypeError');
        } catch (error) {
          expect(error).toBeInstanceOf(TypeError);
          expect((error as TypeError).message).toBe('Unexpected error');
          expect(mockLoggerService.error).toHaveBeenCalled();
        }
      });
    });

    describe('Sanitization', () => {
      it('should parse successfully even with extra fields', async () => {
        const jsonWithExtraFields = JSON.stringify({
          trainingPlans: [
            {
              name: 'Test Plan',
              notes: 'Some notes',
              duration: 60,
              extraField: 'This should be ignored',
              anotherExtra: 123,
              exercises: [
                {
                  order: 1,
                  name: 'Bench Press',
                  type: 'main',
                  notes: 'Exercise notes',
                  unknownField: 'ignored',
                  sets: [
                    {
                      order: 1,
                      repetitions: 10,
                      weight: 60,
                      durationInSeconds: 0,
                      restAfterSetInSeconds: 90,
                      extraSetField: 'also ignored',
                    },
                  ],
                },
              ],
            },
          ],
          topLevelExtra: 'This is also ignored',
        });

        const result = await service.parse(jsonWithExtraFields);

        expect(result).toBeDefined();
        expect(result.trainingPlans).toHaveLength(1);
        expect(result.trainingPlans[0].name).toBe('Test Plan');
        expect(result.trainingPlans[0].duration).toBe(60);
        expect(result.trainingPlans[0].exercises).toHaveLength(1);

        expect((result.trainingPlans[0] as any).extraField).toBeUndefined();
        expect(
          (result.trainingPlans[0].exercises[0] as any).unknownField,
        ).toBeUndefined();
      });
    });
  });
});
