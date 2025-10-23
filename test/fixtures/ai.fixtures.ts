import { GenerateWorkoutDto } from '../../src/ai/dto/generate-workout.dto';
import { CreateWorkoutBulkDto } from '../../src/workouts/dto/bulk';

/**
 * Creates test AI generate workout data with optional overrides
 */
export const createTestGenerateWorkoutData = (
  overrides?: Partial<GenerateWorkoutDto>,
): GenerateWorkoutDto => ({
  goal: 'Build muscle mass',
  experienceLevel: 'intermediate',
  daysPerWeek: 3,
  durationInMinutes: 60,
  availableEquipment: 'Dumbbells, barbell, bench',
  ...overrides,
});

/**
 * Creates test bulk workout data with exercises and sets
 */
export const createTestBulkWorkoutData = (
  suffix = '',
): CreateWorkoutBulkDto => ({
  name: `Push Day Workout${suffix}`,
  notes: `Upper body push exercises${suffix}`,
  duration: 60,
  exercises: [
    {
      order: 1,
      name: 'Bench Press',
      type: 'Strength',
      notes: 'Compound chest exercise',
      sets: [
        {
          order: 1,
          repetitions: 10,
          weight: 60,
          restAfterSetInSeconds: 90,
        },
        {
          order: 2,
          repetitions: 8,
          weight: 70,
          restAfterSetInSeconds: 90,
        },
      ],
    },
    {
      order: 2,
      name: 'Overhead Press',
      type: 'Strength',
      notes: 'Shoulder exercise',
      sets: [
        {
          order: 1,
          repetitions: 10,
          weight: 40,
          restAfterSetInSeconds: 60,
        },
      ],
    },
  ],
});
