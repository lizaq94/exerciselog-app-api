import { Test, TestingModule } from '@nestjs/testing';
import { AiResponseTransformerService } from './ai-response-transformer.service';
import { LoggerService } from '../../../logger/logger.service';
import {
  MOCK_AI_RESPONSE_SINGLE_PLAN,
  MOCK_AI_RESPONSE_PUSH_PULL_LEGS,
  MOCK_AI_RESPONSE_BODYWEIGHT,
  MOCK_AI_RESPONSE_MINIMAL,
} from '../__mocks__/ai-responses.mock';

describe('AiResponseTransformerService', () => {
  let service: AiResponseTransformerService;
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
        AiResponseTransformerService,
        {
          provide: LoggerService,
          useFactory: mockLoggerServiceFactory,
        },
      ],
    }).compile();

    service = module.get<AiResponseTransformerService>(
      AiResponseTransformerService,
    );
    mockLoggerService = module.get(LoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('transformToAppFormat', () => {
    describe('Happy Path - Single Training Plan', () => {
      it('should transform single training plan with all fields correctly', () => {
        const result = service.transformToAppFormat(
          MOCK_AI_RESPONSE_SINGLE_PLAN as any,
        );

        expect(result).toBeDefined();
        expect(result).toHaveLength(1);

        const plan = result[0];
        expect(plan.name).toBe('Push Day - Upper Body Strength');
        expect(plan.notes).toBe(
          'Focus on chest, shoulders, and triceps. Maintain proper form throughout all exercises. Rest 90-120 seconds between sets.',
        );
        expect(plan.duration).toBe(60);
        expect(plan.exercises).toHaveLength(5);

        const firstExercise = plan.exercises[0];
        expect(firstExercise.order).toBe(1);
        expect(firstExercise.name).toBe('Dynamic Warmup');
        expect(firstExercise.type).toBe('warmup');
        expect(firstExercise.notes).toBe(
          'Arm circles, shoulder rotations, light cardio for 5 minutes',
        );
        expect(firstExercise.sets).toHaveLength(1);

        const firstSet = firstExercise.sets[0];
        expect(firstSet.order).toBe(1);
        expect(firstSet.repetitions).toBe(0);
        expect(firstSet.weight).toBe(0);
        expect(firstSet.durationInSeconds).toBe(300);
        expect(firstSet.restAfterSetInSeconds).toBe(0);

        expect(mockLoggerService.log).toHaveBeenCalledWith(
          'Transforming 1 training plans to app format',
          AiResponseTransformerService.name,
        );
        expect(mockLoggerService.log).toHaveBeenCalledWith(
          'Successfully transformed 1 workout plans',
          AiResponseTransformerService.name,
        );
      });

      it('should transform plan with single exercise', () => {
        const result = service.transformToAppFormat(
          MOCK_AI_RESPONSE_MINIMAL as any,
        );

        expect(result).toBeDefined();
        expect(result).toHaveLength(1);

        const plan = result[0];
        expect(plan.name).toBe('Quick Session');
        expect(plan.notes).toBe('Short and effective');
        expect(plan.duration).toBe(20);
        expect(plan.exercises).toHaveLength(1);

        const firstExercise = plan.exercises[0];
        expect(firstExercise.order).toBe(1);
        expect(firstExercise.name).toBe('Quick Exercise');
        expect(firstExercise.type).toBe('main');
        expect(firstExercise.notes).toBe('Just do it');
        expect(firstExercise.sets).toHaveLength(1);

        const firstSet = firstExercise.sets[0];
        expect(firstSet.order).toBe(1);
        expect(firstSet.repetitions).toBe(10);
        expect(firstSet.weight).toBe(0);
        expect(firstSet.durationInSeconds).toBe(0);
        expect(firstSet.restAfterSetInSeconds).toBe(60);
      });

      it('should transform multiple training plans correctly', () => {
        const result = service.transformToAppFormat(
          MOCK_AI_RESPONSE_PUSH_PULL_LEGS as any,
        );

        expect(result).toBeDefined();
        expect(result).toHaveLength(3);

        expect(result[0].name).toBe('Training A - Push');
        expect(result[0].notes).toBe(
          'Focus on pushing movements: chest, shoulders, triceps. Technique is more important than weight.',
        );
        expect(result[0].duration).toBe(60);
        expect(result[0].exercises).toHaveLength(4);

        expect(result[1].name).toBe('Training B - Pull');
        expect(result[1].notes).toBe(
          'Focus on pulling movements: back, biceps. Engage your back muscles properly.',
        );
        expect(result[1].duration).toBe(60);
        expect(result[1].exercises).toHaveLength(4);

        expect(result[2].name).toBe('Training C - Legs');
        expect(result[2].notes).toBe(
          'Focus on lower body: quads, hamstrings, glutes. Go deep on squats.',
        );
        expect(result[2].duration).toBe(60);
        expect(result[2].exercises).toHaveLength(4);

        expect(mockLoggerService.log).toHaveBeenCalledWith(
          'Transforming 3 training plans to app format',
          AiResponseTransformerService.name,
        );
        expect(mockLoggerService.log).toHaveBeenCalledWith(
          'Successfully transformed 3 workout plans',
          AiResponseTransformerService.name,
        );
      });

      it('should handle zero values for weight (bodyweight exercises)', () => {
        const result = service.transformToAppFormat(
          MOCK_AI_RESPONSE_BODYWEIGHT as any,
        );

        expect(result).toBeDefined();
        expect(result).toHaveLength(1);

        const plan = result[0];
        expect(plan.name).toBe('Bodyweight Circuit - No Equipment');

        plan.exercises.forEach((exercise) => {
          exercise.sets.forEach((set) => {
            expect(set.weight).toBe(0);
          });
        });

        const pushups = plan.exercises.find((ex) => ex.name === 'Push-ups');
        expect(pushups).toBeDefined();
        expect(pushups?.sets).toHaveLength(3);
        expect(pushups?.sets[0].weight).toBe(0);
        expect(pushups?.sets[0].repetitions).toBe(15);
      });

      it('should handle zero values for repetitions (timed exercises)', () => {
        const result = service.transformToAppFormat(
          MOCK_AI_RESPONSE_BODYWEIGHT as any,
        );

        expect(result).toBeDefined();

        const plan = result[0];

        const plankHold = plan.exercises.find((ex) => ex.name === 'Plank Hold');
        expect(plankHold).toBeDefined();
        expect(plankHold?.sets).toHaveLength(2);

        expect(plankHold?.sets[0].repetitions).toBe(0);
        expect(plankHold?.sets[0].durationInSeconds).toBe(60);

        expect(plankHold?.sets[1].repetitions).toBe(0);
        expect(plankHold?.sets[1].durationInSeconds).toBe(45);
      });

      it('should handle empty exercises array', () => {
        const mockEmptyExercises = {
          trainingPlans: [
            {
              name: 'Empty Plan',
              notes: 'No exercises',
              duration: 20,
              exercises: [],
            },
          ],
        };

        const result = service.transformToAppFormat(mockEmptyExercises as any);

        expect(result).toBeDefined();
        expect(result).toHaveLength(1);
        expect(result[0].name).toBe('Empty Plan');
        expect(result[0].exercises).toEqual([]);
        expect(result[0].exercises).toHaveLength(0);
      });

      it('should handle empty sets array', () => {
        const mockEmptySets = {
          trainingPlans: [
            {
              name: 'Plan with Empty Sets',
              notes: 'Exercise without sets',
              duration: 20,
              exercises: [
                {
                  order: 1,
                  name: 'Exercise Without Sets',
                  type: 'main',
                  notes: 'No sets defined',
                  sets: [],
                },
              ],
            },
          ],
        };

        const result = service.transformToAppFormat(mockEmptySets as any);

        expect(result).toBeDefined();
        expect(result).toHaveLength(1);
        expect(result[0].exercises).toHaveLength(1);
        expect(result[0].exercises[0].name).toBe('Exercise Without Sets');
        expect(result[0].exercises[0].sets).toEqual([]);
        expect(result[0].exercises[0].sets).toHaveLength(0);
      });

      it('should not mutate original input data', () => {
        const originalInput = {
          trainingPlans: [
            {
              name: 'Test Plan',
              notes: 'Original notes',
              duration: 30,
              exercises: [
                {
                  order: 1,
                  name: 'Test Exercise',
                  type: 'main',
                  notes: 'Exercise notes',
                  sets: [
                    {
                      order: 1,
                      repetitions: 10,
                      weight: 50,
                      durationInSeconds: 0,
                      restAfterSetInSeconds: 60,
                    },
                  ],
                },
              ],
            },
          ],
        };

        const inputCopy = JSON.parse(JSON.stringify(originalInput));

        service.transformToAppFormat(originalInput as any);

        expect(originalInput).toEqual(inputCopy);
        expect(originalInput.trainingPlans[0].name).toBe('Test Plan');
        expect(originalInput.trainingPlans[0].exercises[0].name).toBe(
          'Test Exercise',
        );
      });
    });
  });
});
