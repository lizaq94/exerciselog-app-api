import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { NON_EXISTENT_UUID } from '../constants/test-ids';
import {
  createTestBulkWorkoutData,
  createTestGenerateWorkoutData,
} from '../fixtures';
import {
  cleanDatabase,
  expectArrayResponse,
  expectDataProperties,
  setupE2ETest,
  setupSingleUser,
  setupTwoUsers,
  teardownE2ETest,
} from '../helpers';

describe('AiController (e2e)', () => {
  let app: INestApplication;
  let server: any;
  let databaseService: any;

  beforeAll(async () => {
    const context = await setupE2ETest();
    app = context.app;
    server = context.server;
    databaseService = context.databaseService;
  });

  beforeEach(async () => {
    await cleanDatabase(databaseService);
  });

  afterAll(async () => {
    await cleanDatabase(databaseService);
    await teardownE2ETest(app);
  });

  describe('/ai/generate-workout (POST)', () => {
    // Note: This test is skipped because it can take 60-100+ seconds due to AI API response time.
    it.skip('should generate workout plan when provided with valid input data', async () => {
      const generateWorkoutData = createTestGenerateWorkoutData();

      const response = await request(server)
        .post('/ai/generate-workout')
        .send(generateWorkoutData)
        .expect(200);

      expectArrayResponse(response);
      expect(response.body.data.length).toBeGreaterThan(0);

      const workout = response.body.data[0];
      expect(workout).toHaveProperty('name');
      expect(workout).toHaveProperty('exercises');
      expect(Array.isArray(workout.exercises)).toBe(true);
      expect(workout.exercises.length).toBeGreaterThan(0);

      const exercise = workout.exercises[0];
      expect(exercise).toHaveProperty('name');
      expect(exercise).toHaveProperty('type');
      expect(exercise).toHaveProperty('order');
      expect(exercise).toHaveProperty('sets');
      expect(Array.isArray(exercise.sets)).toBe(true);
      expect(exercise.sets.length).toBeGreaterThan(0);

      const set = exercise.sets[0];
      expect(set).toHaveProperty('order');
    }, 90000);

    it('should throw validation error when provided with invalid data', async () => {
      const invalidData = {
        goal: '',
        experienceLevel: 'invalid',
        daysPerWeek: -1,
      };

      await request(server)
        .post('/ai/generate-workout')
        .send(invalidData)
        .expect(400);
    });
  });

  describe('/users/:id/workouts/bulk (POST)', () => {
    it('should save bulk workout when authenticated user saves workout for themselves', async () => {
      const { agent, user } = await setupSingleUser(server);
      const bulkWorkoutData = createTestBulkWorkoutData();

      const response = await agent
        .post(`/users/${user.id}/workouts/bulk`)
        .send(bulkWorkoutData)
        .expect(201);

      expectDataProperties(response, {
        id: undefined,
        name: bulkWorkoutData.name,
        notes: bulkWorkoutData.notes,
        duration: bulkWorkoutData.duration,
        userId: user.id,
      });

      expect(response.body.data).toHaveProperty('exercises');
      expect(Array.isArray(response.body.data.exercises)).toBe(true);
      expect(response.body.data.exercises).toHaveLength(2);

      const savedExercise = response.body.data.exercises[0];
      expect(savedExercise).toHaveProperty('id');
      expect(savedExercise).toHaveProperty('name', 'Bench Press');
      expect(savedExercise).toHaveProperty('order', 1);
      expect(savedExercise).toHaveProperty('sets');
      expect(Array.isArray(savedExercise.sets)).toBe(true);
      expect(savedExercise.sets).toHaveLength(2);

      const savedSet = savedExercise.sets[0];
      expect(savedSet).toHaveProperty('id');
      expect(savedSet).toHaveProperty('order', 1);
      expect(savedSet).toHaveProperty('repetitions', 10);
      expect(savedSet).toHaveProperty('weight', 60);
      expect(savedSet).toHaveProperty('restAfterSetInSeconds', 90);
    });

    it('should throw UnauthorizedException when user is not authenticated', async () => {
      const bulkWorkoutData = createTestBulkWorkoutData();

      await request(server)
        .post(`/users/${NON_EXISTENT_UUID}/workouts/bulk`)
        .send(bulkWorkoutData)
        .expect(401);
    });

    it('should throw ForbiddenException when authenticated user tries to save workout for another user', async () => {
      const { agent1, user2 } = await setupTwoUsers(server);
      const bulkWorkoutData = createTestBulkWorkoutData();

      await agent1
        .post(`/users/${user2.id}/workouts/bulk`)
        .send(bulkWorkoutData)
        .expect(403);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const { agent } = await setupSingleUser(server);
      const bulkWorkoutData = createTestBulkWorkoutData();

      await agent
        .post(`/users/${NON_EXISTENT_UUID}/workouts/bulk`)
        .send(bulkWorkoutData)
        .expect(404);
    });
  });

  describe('Complete AI Workout Flow', () => {
    // Note: This test is skipped because AI API response time is unpredictable (30-100+ seconds).
    it.skip('should complete full flow: generate workout and bulk save for authenticated user', async () => {
      const { agent, user } = await setupSingleUser(server);
      const generateWorkoutData = createTestGenerateWorkoutData();

      const generateResponse = await request(server)
        .post('/ai/generate-workout')
        .send(generateWorkoutData)
        .expect(200);

      expectArrayResponse(generateResponse);
      expect(generateResponse.body.data.length).toBeGreaterThan(0);

      const generatedWorkout = generateResponse.body.data[0];
      expect(generatedWorkout).toHaveProperty('name');
      expect(generatedWorkout).toHaveProperty('exercises');

      const saveResponse = await agent
        .post(`/users/${user.id}/workouts/bulk`)
        .send(generatedWorkout)
        .expect(201);

      expectDataProperties(saveResponse, {
        id: undefined,
        name: generatedWorkout.name,
        userId: user.id,
      });

      expect(saveResponse.body.data).toHaveProperty('exercises');
      expect(Array.isArray(saveResponse.body.data.exercises)).toBe(true);
      expect(saveResponse.body.data.exercises.length).toBeGreaterThan(0);

      const savedExercise = saveResponse.body.data.exercises[0];
      expect(savedExercise).toHaveProperty('id');
      expect(savedExercise).toHaveProperty('name');
      expect(savedExercise).toHaveProperty('sets');
      expect(Array.isArray(savedExercise.sets)).toBe(true);
      expect(savedExercise.sets.length).toBeGreaterThan(0);

      const fetchResponse = await agent
        .get(`/workouts/${saveResponse.body.data.id}`)
        .expect(200);

      expectDataProperties(fetchResponse, {
        id: saveResponse.body.data.id,
        name: generatedWorkout.name,
        userId: user.id,
      });
    }, 60000);
  });
});
