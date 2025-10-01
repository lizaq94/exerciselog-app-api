import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UpdateExerciseDto } from '../../src/exercises/dto/update-exercise.dto';
import { NON_EXISTENT_UUID } from '../constants/test-ids';
import { createTestExerciseData, createTestWorkoutData } from '../fixtures';
import {
  cleanDatabase,
  createExercise,
  createWorkout,
  expectArrayResponse,
  expectDataProperties,
  setupE2ETest,
  setupSingleUser,
  setupTwoUsers,
  teardownE2ETest,
} from '../helpers';

describe('ExercisesController (e2e)', () => {
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

  describe('/workouts/:id/exercises (POST)', () => {
    it('should add exercise to own workout when authenticated user provides valid data', async () => {
      const { agent, user } = await setupSingleUser(server);

      const workout = await createWorkout(
        agent,
        user.id,
        createTestWorkoutData(),
      );
      const exerciseData = createTestExerciseData();

      const response = await agent
        .post(`/workouts/${workout.id}/exercises`)
        .send(exerciseData)
        .expect(201);

      expectDataProperties(response, {
        id: undefined,
        name: exerciseData.name,
        notes: exerciseData.notes,
        type: exerciseData.type,
        order: exerciseData.order,
        workoutId: workout.id,
        createdAt: undefined,
      });
    });

    it('should throw ForbiddenException when trying to add exercise to another users workout', async () => {
      const { agent1, agent2, user2 } = await setupTwoUsers(server);

      const workout = await createWorkout(
        agent2,
        user2.id,
        createTestWorkoutData(),
      );

      await agent1
        .post(`/workouts/${workout.id}/exercises`)
        .send(createTestExerciseData())
        .expect(403);
    });

    it('should throw NotFoundException when trying to add exercise to non-existent workout', async () => {
      const { agent } = await setupSingleUser(server);

      await agent
        .post(`/workouts/${NON_EXISTENT_UUID}/exercises`)
        .send(createTestExerciseData())
        .expect(404);
    });

    it('should throw UnauthorizedException when unauthenticated user tries to add exercise', async () => {
      await request(server)
        .post(`/workouts/${NON_EXISTENT_UUID}/exercises`)
        .send(createTestExerciseData())
        .expect(401);
    });

    it('should throw validation error when provided with invalid exercise data', async () => {
      const { agent, user } = await setupSingleUser(server);

      const workout = await createWorkout(
        agent,
        user.id,
        createTestWorkoutData(),
      );

      const invalidExerciseData = {
        name: '',
        order: -1,
        type: 'Strength',
        notes: 'Notes',
      };

      await agent
        .post(`/workouts/${workout.id}/exercises`)
        .send(invalidExerciseData)
        .expect(400);
    });
  });
  describe('/exercises/:id (GET)', () => {
    it('should retrieve own exercise when authenticated user provides valid id', async () => {
      const { agent, user } = await setupSingleUser(server);

      const workout = await createWorkout(
        agent,
        user.id,
        createTestWorkoutData(),
      );
      const exercise = await createExercise(
        agent,
        workout.id,
        createTestExerciseData(),
      );

      const response = await agent.get(`/exercises/${exercise.id}`).expect(200);

      expectDataProperties(response, {
        id: exercise.id,
        name: exercise.name,
      });
    });

    it('should throw NotFoundException when trying to retrieve non-existent exercise', async () => {
      const { agent } = await setupSingleUser(server);

      await agent.get(`/exercises/${NON_EXISTENT_UUID}`).expect(404);
    });

    it('should throw UnauthorizedException when unauthenticated user tries to retrieve exercise', async () => {
      await request(server).get(`/exercises/${NON_EXISTENT_UUID}`).expect(401);
    });
  });

  describe('/exercises/:id (PATCH)', () => {
    it('should update own exercise when authenticated user provides valid data', async () => {
      const { agent, user } = await setupSingleUser(server);

      const workout = await createWorkout(
        agent,
        user.id,
        createTestWorkoutData(),
      );
      const exercise = await createExercise(
        agent,
        workout.id,
        createTestExerciseData(),
      );

      const updateData: UpdateExerciseDto = {
        name: 'Updated Exercise Name',
        notes: 'Updated notes',
      };

      const response = await agent
        .patch(`/exercises/${exercise.id}`)
        .send(updateData)
        .expect(200);

      expectDataProperties(response, {
        id: exercise.id,
        name: updateData.name,
        notes: updateData.notes,
      });
    });

    it('should throw ForbiddenException when trying to update another users exercise', async () => {
      const { agent1, agent2, user2 } = await setupTwoUsers(server);

      const workout = await createWorkout(
        agent2,
        user2.id,
        createTestWorkoutData(),
      );
      const exercise = await createExercise(
        agent2,
        workout.id,
        createTestExerciseData(),
      );

      await agent1
        .patch(`/exercises/${exercise.id}`)
        .send({ name: 'Malicious Update' })
        .expect(403);
    });

    it('should throw NotFoundException when trying to update non-existent exercise', async () => {
      const { agent } = await setupSingleUser(server);

      await agent
        .patch(`/exercises/${NON_EXISTENT_UUID}`)
        .send({ name: 'Updated Name' })
        .expect(404);
    });

    it('should throw UnauthorizedException when unauthenticated user tries to update exercise', async () => {
      await request(server)
        .patch(`/exercises/${NON_EXISTENT_UUID}`)
        .send({ name: 'Updated Name' })
        .expect(401);
    });

    it('should throw validation error when provided with invalid update data', async () => {
      const { agent, user } = await setupSingleUser(server);

      const workout = await createWorkout(
        agent,
        user.id,
        createTestWorkoutData(),
      );
      const exercise = await createExercise(
        agent,
        workout.id,
        createTestExerciseData(),
      );

      const invalidUpdateData = {
        order: -1,
      };

      await agent
        .patch(`/exercises/${exercise.id}`)
        .send(invalidUpdateData)
        .expect(400);
    });
  });

  describe('/exercises/:id (DELETE)', () => {
    it('should delete own exercise when authenticated user provides valid id', async () => {
      const { agent, user } = await setupSingleUser(server);

      const workout = await createWorkout(
        agent,
        user.id,
        createTestWorkoutData(),
      );
      const exercise = await createExercise(
        agent,
        workout.id,
        createTestExerciseData(),
      );

      await agent.delete(`/exercises/${exercise.id}`).expect(204);
      await agent.get(`/exercises/${exercise.id}`).expect(404);
    });

    it('should throw ForbiddenException when trying to delete another users exercise', async () => {
      const { agent1, agent2, user2 } = await setupTwoUsers(server);

      const workout = await createWorkout(
        agent2,
        user2.id,
        createTestWorkoutData(),
      );
      const exercise = await createExercise(
        agent2,
        workout.id,
        createTestExerciseData(),
      );

      await agent1.delete(`/exercises/${exercise.id}`).expect(403);

      const verifyResponse = await agent2
        .get(`/exercises/${exercise.id}`)
        .expect(200);
      expect(verifyResponse.body.data).toHaveProperty('id', exercise.id);
    });

    it('should throw NotFoundException when trying to delete non-existent exercise', async () => {
      const { agent } = await setupSingleUser(server);

      await agent.delete(`/exercises/${NON_EXISTENT_UUID}`).expect(404);
    });

    it('should throw UnauthorizedException when unauthenticated user tries to delete exercise', async () => {
      await request(server)
        .delete(`/exercises/${NON_EXISTENT_UUID}`)
        .expect(401);
    });
  });

  describe('/workouts/:id/exercises (GET)', () => {
    it('should retrieve all exercises for own workout when authenticated', async () => {
      const { agent, user } = await setupSingleUser(server);

      const workout = await createWorkout(
        agent,
        user.id,
        createTestWorkoutData(),
      );
      await createExercise(agent, workout.id, createTestExerciseData('1'));
      await createExercise(agent, workout.id, createTestExerciseData('2'));

      const response = await agent
        .get(`/workouts/${workout.id}/exercises`)
        .expect(200);

      expectArrayResponse(response, 2);
    });

    it('should throw NotFoundException when trying to retrieve exercises from non-existent workout', async () => {
      const { agent } = await setupSingleUser(server);

      await agent.get(`/workouts/${NON_EXISTENT_UUID}/exercises`).expect(404);
    });

    it('should throw UnauthorizedException when unauthenticated user tries to retrieve exercises', async () => {
      await request(server)
        .get(`/workouts/${NON_EXISTENT_UUID}/exercises`)
        .expect(401);
    });
  });
});
