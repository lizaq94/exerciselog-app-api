import { CreateExerciseDto } from '../../src/exercises/dto/create-exercise.dto';

/**
 * Creates test exercise data with optional suffix for uniqueness
 */
export const createTestExerciseData = (suffix = ''): CreateExerciseDto => ({
  name: `Bench Press${suffix}`,
  order: 1,
  type: 'Strength',
  notes: `Exercise notes${suffix}`,
});
