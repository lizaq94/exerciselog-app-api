import { INestApplication } from '@nestjs/common';
import { join } from 'path';
import { NON_EXISTENT_UUID } from '../constants/test-ids';
import { createTestExerciseData, createTestWorkoutData } from '../fixtures';
import {
  cleanDatabase,
  createExercise,
  createWorkout,
  setupE2ETest,
  setupSingleUser,
  setupTwoUsers,
  teardownE2ETest,
} from '../helpers';
import * as request from 'supertest';

describe('Uploads (e2e)', () => {
  let app: INestApplication;
  let server: any;
  let databaseService: any;

  const testImagePath = join(__dirname, '../fixtures/test-image.jpg');

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

  describe('/exercises/:id/image (POST)', () => {
    it('should upload image to own exercise when authenticated user provides valid image file', async () => {
      const { agent, user } = await setupSingleUser(server);
      const workoutData = createTestWorkoutData();
      const workout = await createWorkout(agent, user.id, workoutData);

      const exerciseData = createTestExerciseData();
      const exercise = await createExercise(agent, workout.id, exerciseData);

      const response = await agent
        .post(`/exercises/${exercise.id}/image`)
        .attach('image', testImagePath)
        .expect(201);

      expect(response.body).toHaveProperty('apiVersion');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('path');
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('mime');
      expect(response.body.data).toHaveProperty('type');
      expect(response.body.data.path).toContain('cloudfront.net');
      expect(response.body.data).toHaveProperty('exerciseId', exercise.id);
    });

    it('should throw ForbiddenException when authenticated user tries to upload image to another users exercise', async () => {
      const { agent1, agent2, user2 } = await setupTwoUsers(server);
      const workoutData = createTestWorkoutData();
      const workout = await createWorkout(agent2, user2.id, workoutData);

      const exerciseData = createTestExerciseData();
      const exercise = await createExercise(agent2, workout.id, exerciseData);

      await agent1
        .post(`/exercises/${exercise.id}/image`)
        .attach('image', testImagePath)
        .expect(403);
    });

    it('should throw BadRequestException when provided with unsupported file type', async () => {
      const { agent, user } = await setupSingleUser(server);
      const workoutData = createTestWorkoutData();
      const workout = await createWorkout(agent, user.id, workoutData);

      const exerciseData = createTestExerciseData();
      const exercise = await createExercise(agent, workout.id, exerciseData);

      const testTextFilePath = join(__dirname, '../fixtures/test-file.txt');

      const response = await agent
        .post(`/exercises/${exercise.id}/image`)
        .attach('image', testTextFilePath)
        .expect(400);

      expect(response.body.response).toHaveProperty('message');
      expect(response.body.response.message).toContain(
        'Mime type not supported',
      );
    });

    it('should throw UnauthorizedException when uploading file without authentication', async () => {
      await request(server)
        .post(`/exercises/${NON_EXISTENT_UUID}/image`)
        .attach('image', testImagePath)
        .expect(401);
    });

    it('should throw NotFoundException when trying to upload image to non-existent exercise', async () => {
      const { agent } = await setupSingleUser(server);

      await agent
        .post(`/exercises/${NON_EXISTENT_UUID}/image`)
        .attach('image', testImagePath)
        .expect(404);
    });

    it('should throw BadRequestException when no file is provided', async () => {
      const { agent, user } = await setupSingleUser(server);
      const workoutData = createTestWorkoutData();
      const workout = await createWorkout(agent, user.id, workoutData);

      const exerciseData = createTestExerciseData();
      const exercise = await createExercise(agent, workout.id, exerciseData);

      await agent.post(`/exercises/${exercise.id}/image`).expect(400);
    });
  });
});
