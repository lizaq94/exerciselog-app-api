import { CreateWorkoutDto } from '../../src/workouts/dtos/create-workout.dto';

/**
 * Creates test workout data with optional suffix for uniqueness
 */
export const createTestWorkoutData = (suffix = ''): CreateWorkoutDto => ({
  name: `Morning Workout${suffix}`,
  notes: `Test workout notes${suffix}`,
  duration: 60,
});
