import { CreateWorkoutDto } from '../../src/workouts/dtos/create-workout.dto';
import { CreateExerciseDto } from '../../src/exercises/dto/create-exercise.dto';
import { CreateSetDto } from '../../src/sets/dto/create-set.dto';

/**
 * Creates a workout for a user via API
 *
 * @param agent - Supertest agent with authentication
 * @param userId - ID of the user to create workout for
 * @param workoutData - Workout data to create
 * @returns Created workout data
 */
export const createWorkout = async (
  agent: any,
  userId: string,
  workoutData: CreateWorkoutDto,
) => {
  const response = await agent
    .post(`/users/${userId}/workouts`)
    .send(workoutData)
    .expect(201);

  return response.body.data;
};

/**
 * Creates an exercise for a workout via API
 *
 * @param agent - Supertest agent with authentication
 * @param workoutId - ID of the workout to add exercise to
 * @param exerciseData - Exercise data to create
 * @returns Created exercise data
 */
export const createExercise = async (
  agent: any,
  workoutId: string,
  exerciseData: CreateExerciseDto,
) => {
  const response = await agent
    .post(`/workouts/${workoutId}/exercises`)
    .send(exerciseData)
    .expect(201);

  return response.body.data;
};

/**
 * Creates a set for an exercise via API
 *
 * @param agent - Supertest agent with authentication
 * @param exerciseId - ID of the exercise to add set to
 * @param setData - Set data to create
 * @returns Created set data
 */
export const createSet = async (
  agent: any,
  exerciseId: string,
  setData: CreateSetDto,
) => {
  const response = await agent
    .post(`/exercises/${exerciseId}/sets`)
    .send(setData)
    .expect(201);

  return response.body.data;
};
