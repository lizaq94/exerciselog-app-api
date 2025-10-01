import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UpdateSetDto } from '../../src/sets/dto/update-set.dto';
import { NON_EXISTENT_UUID } from '../constants/test-ids';
import {
  createTestExerciseData,
  createTestSetData,
  createTestWorkoutData,
} from '../fixtures';
import {
  cleanDatabase,
  createExercise,
  createSet,
  createWorkout,
  expectArrayResponse,
  expectDataProperties,
  setupE2ETest,
  setupSingleUser,
  setupTwoUsers,
  teardownE2ETest,
} from '../helpers';

describe('SetsController (e2e)', () => {
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

  describe('/exercises/:id/sets (POST)', () => {
    it('should add set to own exercise when authenticated user provides valid data', async () => {
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
      const setData = createTestSetData();

      const response = await agent
        .post(`/exercises/${exercise.id}/sets`)
        .send(setData)
        .expect(201);

      expectDataProperties(response, {
        id: undefined, // just check it exists
        repetitions: setData.repetitions,
        weight: setData.weight,
        order: setData.order,
        exerciseId: exercise.id,
      });
    });

    it('should throw ForbiddenException when trying to add set to another users exercise', async () => {
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
        .post(`/exercises/${exercise.id}/sets`)
        .send(createTestSetData())
        .expect(403);
    });

    it('should throw NotFoundException when trying to add set to non-existent exercise', async () => {
      const { agent } = await setupSingleUser(server);

      await agent
        .post(`/exercises/${NON_EXISTENT_UUID}/sets`)
        .send(createTestSetData())
        .expect(404);
    });

    it('should throw UnauthorizedException when unauthenticated user tries to add set', async () => {
      await request(server)
        .post(`/exercises/${NON_EXISTENT_UUID}/sets`)
        .send(createTestSetData())
        .expect(401);
    });

    it('should throw validation error when provided with invalid set data', async () => {
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

      const invalidSetData = {
        repetitions: 10,
        weight: -5, // Invalid: negative weight
        order: 1,
      };

      await agent
        .post(`/exercises/${exercise.id}/sets`)
        .send(invalidSetData)
        .expect(400);
    });
  });

  describe('/sets/:id (GET)', () => {
    it('should retrieve own set when authenticated user provides valid id', async () => {
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
      const set = await createSet(agent, exercise.id, createTestSetData());

      const response = await agent.get(`/sets/${set.id}`).expect(200);

      expectDataProperties(response, {
        id: set.id,
        repetitions: set.repetitions,
        weight: set.weight,
      });
    });

    it('should throw NotFoundException when trying to retrieve non-existent set', async () => {
      const { agent } = await setupSingleUser(server);

      await agent.get(`/sets/${NON_EXISTENT_UUID}`).expect(404);
    });

    it('should throw UnauthorizedException when unauthenticated user tries to retrieve set', async () => {
      await request(server).get(`/sets/${NON_EXISTENT_UUID}`).expect(401);
    });
  });

  describe('/sets/:id (PATCH)', () => {
    it('should update own set when authenticated user provides valid data', async () => {
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
      const set = await createSet(agent, exercise.id, createTestSetData());

      const updateData: UpdateSetDto = {
        repetitions: 15,
        weight: 60,
      };

      const response = await agent
        .patch(`/sets/${set.id}`)
        .send(updateData)
        .expect(200);

      expectDataProperties(response, {
        id: set.id,
        repetitions: updateData.repetitions,
        weight: updateData.weight,
      });
    });

    it('should throw ForbiddenException when trying to update another users set', async () => {
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
      const set = await createSet(agent2, exercise.id, createTestSetData());

      await agent1
        .patch(`/sets/${set.id}`)
        .send({ repetitions: 20 })
        .expect(403);
    });

    it('should throw NotFoundException when trying to update non-existent set', async () => {
      const { agent } = await setupSingleUser(server);

      await agent
        .patch(`/sets/${NON_EXISTENT_UUID}`)
        .send({ repetitions: 15 })
        .expect(404);
    });

    it('should throw UnauthorizedException when unauthenticated user tries to update set', async () => {
      await request(server)
        .patch(`/sets/${NON_EXISTENT_UUID}`)
        .send({ repetitions: 15 })
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
      const set = await createSet(agent, exercise.id, createTestSetData());

      await agent.patch(`/sets/${set.id}`).send({ weight: -10 }).expect(400);
    });
  });

  describe('/sets/:id (DELETE)', () => {
    it('should delete own set when authenticated user provides valid id', async () => {
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
      const set = await createSet(agent, exercise.id, createTestSetData());

      await agent.delete(`/sets/${set.id}`).expect(204);
      await agent.get(`/sets/${set.id}`).expect(404);
    });

    it('should throw ForbiddenException when trying to delete another users set', async () => {
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
      const set = await createSet(agent2, exercise.id, createTestSetData());

      await agent1.delete(`/sets/${set.id}`).expect(403);

      const verifyResponse = await agent2.get(`/sets/${set.id}`).expect(200);
      expect(verifyResponse.body.data).toHaveProperty('id', set.id);
    });

    it('should throw NotFoundException when trying to delete non-existent set', async () => {
      const { agent } = await setupSingleUser(server);

      await agent.delete(`/sets/${NON_EXISTENT_UUID}`).expect(404);
    });

    it('should throw UnauthorizedException when unauthenticated user tries to delete set', async () => {
      await request(server).delete(`/sets/${NON_EXISTENT_UUID}`).expect(401);
    });
  });

  describe('/exercises/:id/sets (GET)', () => {
    it('should retrieve all sets for own exercise when authenticated', async () => {
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

      await createSet(agent, exercise.id, createTestSetData(1));
      await createSet(agent, exercise.id, createTestSetData(2));
      await createSet(agent, exercise.id, createTestSetData(3));

      const response = await agent
        .get(`/exercises/${exercise.id}/sets`)
        .expect(200);

      expectArrayResponse(response, 3);
    }, 15000);

    it('should throw NotFoundException when trying to retrieve sets from non-existent exercise', async () => {
      const { agent } = await setupSingleUser(server);

      await agent.get(`/exercises/${NON_EXISTENT_UUID}/sets`).expect(404);
    });

    it('should throw UnauthorizedException when unauthenticated user tries to retrieve sets', async () => {
      await request(server)
        .get(`/exercises/${NON_EXISTENT_UUID}/sets`)
        .expect(401);
    });
  });
});
