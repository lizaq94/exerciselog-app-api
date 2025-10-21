import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { OpenRouterProvider } from './open-router.provider';
import { AiResponseParserService } from '../services/ai-response-parser/ai-response-parser.service';
import { AiResponseTransformerService } from '../services/ai-response-transformer/ai-response-transformer.service';
import { LoggerService } from '../../logger/logger.service';
import { GenerateWorkoutDto } from '../dto/generate-workout.dto';
import { BadRequestException } from '@nestjs/common';
import { AI_PARSER_ERROR_MESSAGES } from '../services/constants/ai-response-parser.constants';

describe('AiService', () => {
  let service: AiService;
  let mockOpenRouterProvider: jest.Mocked<OpenRouterProvider>;
  let mockParserService: jest.Mocked<AiResponseParserService>;
  let mockTransformerService: jest.Mocked<AiResponseTransformerService>;
  let mockLoggerService: jest.Mocked<LoggerService>;

  const mockOpenRouterProviderFactory = () => ({
    generateWorkout: jest.fn(),
  });

  const mockParserServiceFactory = () => ({
    parse: jest.fn(),
  });

  const mockTransformerServiceFactory = () => ({
    transformToAppFormat: jest.fn(),
  });

  const mockLoggerServiceFactory = () => ({
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  });

  const mockGenerateWorkoutDto: GenerateWorkoutDto = {
    goal: 'Build muscle with push pull legs split',
    experienceLevel: 'intermediate',
    daysPerWeek: 3,
    durationInMinutes: 60,
  };

  const mockRawResponse = JSON.stringify({
    trainingPlans: [
      {
        name: 'Push Day',
        notes: 'Focus on chest and triceps',
        duration: 60,
        exercises: [
          {
            order: 1,
            name: 'Bench Press',
            type: 'main',
            notes: 'Keep back flat',
            sets: [
              {
                order: 1,
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

  const mockParsedResponse = {
    trainingPlans: [
      {
        name: 'Push Day',
        notes: 'Focus on chest and triceps',
        duration: 60,
        exercises: [
          {
            order: 1,
            name: 'Bench Press',
            type: 'main',
            notes: 'Keep back flat',
            sets: [
              {
                order: 1,
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
  };

  const mockTransformedPlans = [
    {
      name: 'Push Day',
      notes: 'Focus on chest and triceps',
      duration: 60,
      exercises: [
        {
          order: 1,
          name: 'Bench Press',
          type: 'main',
          notes: 'Keep back flat',
          sets: [
            {
              order: 1,
              repetitions: 10,
              weight: 60,
              durationInSeconds: 0,
              restAfterSetInSeconds: 90,
            },
          ],
        },
      ],
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: OpenRouterProvider,
          useFactory: mockOpenRouterProviderFactory,
        },
        {
          provide: AiResponseParserService,
          useFactory: mockParserServiceFactory,
        },
        {
          provide: AiResponseTransformerService,
          useFactory: mockTransformerServiceFactory,
        },
        {
          provide: LoggerService,
          useFactory: mockLoggerServiceFactory,
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    mockOpenRouterProvider = module.get(OpenRouterProvider);
    mockParserService = module.get(AiResponseParserService);
    mockTransformerService = module.get(AiResponseTransformerService);
    mockLoggerService = module.get(LoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateWorkout - Integration Tests', () => {
    it('should complete full flow: OpenRouter → parse → transform → return plans', async () => {
      mockOpenRouterProvider.generateWorkout.mockResolvedValue(mockRawResponse);
      mockParserService.parse.mockResolvedValue(mockParsedResponse);
      mockTransformerService.transformToAppFormat.mockReturnValue(
        mockTransformedPlans,
      );

      const result = await service.generateWorkout(mockGenerateWorkoutDto);

      expect(result).toEqual(mockTransformedPlans);
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe('Push Day');

      expect(mockOpenRouterProvider.generateWorkout).toHaveBeenCalledWith(
        mockGenerateWorkoutDto,
      );
      expect(mockOpenRouterProvider.generateWorkout).toHaveBeenCalledTimes(1);

      expect(mockParserService.parse).toHaveBeenCalledWith(mockRawResponse);
      expect(mockParserService.parse).toHaveBeenCalledTimes(1);

      expect(mockTransformerService.transformToAppFormat).toHaveBeenCalledWith(
        mockParsedResponse,
      );
      expect(mockTransformerService.transformToAppFormat).toHaveBeenCalledTimes(
        1,
      );

      expect(mockLoggerService.log).toHaveBeenCalledWith(
        'Successfully generated 1 workout plans',
      );
    });

    it('should propagate error when OpenRouter fails', async () => {
      const openRouterError = new Error('OpenRouter API failed');
      mockOpenRouterProvider.generateWorkout.mockRejectedValue(openRouterError);

      await expect(
        service.generateWorkout(mockGenerateWorkoutDto),
      ).rejects.toThrow(
        'Failed to generate workout for goal "Build muscle with push pull legs split": OpenRouter API failed',
      );

      expect(mockOpenRouterProvider.generateWorkout).toHaveBeenCalledTimes(1);

      expect(mockParserService.parse).not.toHaveBeenCalled();

      expect(
        mockTransformerService.transformToAppFormat,
      ).not.toHaveBeenCalled();
    });

    it('should handle invalid JSON from OpenRouter', async () => {
      const invalidJson = 'invalid json';
      mockOpenRouterProvider.generateWorkout.mockResolvedValue(invalidJson);
      mockParserService.parse.mockRejectedValue(
        new BadRequestException(AI_PARSER_ERROR_MESSAGES.INVALID_JSON),
      );

      await expect(
        service.generateWorkout(mockGenerateWorkoutDto),
      ).rejects.toThrow(
        `Failed to generate workout for goal "Build muscle with push pull legs split": ${AI_PARSER_ERROR_MESSAGES.INVALID_JSON}`,
      );

      expect(mockOpenRouterProvider.generateWorkout).toHaveBeenCalledWith(
        mockGenerateWorkoutDto,
      );
      expect(mockOpenRouterProvider.generateWorkout).toHaveBeenCalledTimes(1);

      expect(mockParserService.parse).toHaveBeenCalledWith(invalidJson);
      expect(mockParserService.parse).toHaveBeenCalledTimes(1);

      expect(
        mockTransformerService.transformToAppFormat,
      ).not.toHaveBeenCalled();
    });

    it('should log at each stage of the flow', async () => {
      mockOpenRouterProvider.generateWorkout.mockResolvedValue(mockRawResponse);
      mockParserService.parse.mockResolvedValue(mockParsedResponse);
      mockTransformerService.transformToAppFormat.mockReturnValue(
        mockTransformedPlans,
      );

      await service.generateWorkout(mockGenerateWorkoutDto);

      expect(mockLoggerService.log).toHaveBeenCalledWith(
        'Successfully generated 1 workout plans',
      );
      expect(mockLoggerService.log).toHaveBeenCalledTimes(1);
    });
  });
});
