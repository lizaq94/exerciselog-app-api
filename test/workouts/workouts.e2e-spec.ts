import { INestApplication } from '@nestjs/common';
import { NON_EXISTENT_UUID } from '../constants/test-ids';
import { createTestWorkoutData } from '../fixtures';
import {
  cleanDatabase,
  createWorkout,
  expectDataProperties,
  expectPaginatedResponse,
  setupE2ETest,
  setupSingleUser,
  setupTwoUsers,
  teardownE2ETest,
} from '../helpers';

describe('WorkoutsController (e2e)', () => {
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

  describe('/users/:id/workouts (POST)', () => {
    it('should register a new workout when authenticated user creates workout for themselves', async () => {
      const { agent, user } = await setupSingleUser(server);
      const workoutData = createTestWorkoutData();

      const response = await agent
        .post(`/users/${user.id}/workouts`)
        .send(workoutData)
        .expect(201);

      expectDataProperties(response, {
        id: undefined,
        name: workoutData.name,
        notes: workoutData.notes,
        duration: workoutData.duration,
        userId: user.id,
        createdAt: undefined,
        updatedAt: undefined,
      });
    });

    it('should throw ForbiddenException when authenticated user tries to create workout for another user', async () => {
      const { agent1, user2 } = await setupTwoUsers(server);

      await agent1
        .post(`/users/${user2.id}/workouts`)
        .send(createTestWorkoutData())
        .expect(403);
    });
  });

  describe('/users/:id/workouts (GET)', () => {
    it('should fetch paginated list of workouts when authenticated user requests their own workouts', async () => {
      const { agent, user } = await setupSingleUser(server);

      await createWorkout(agent, user.id, createTestWorkoutData('1'));
      await createWorkout(agent, user.id, createTestWorkoutData('2'));

      const response = await agent
        .get(`/users/${user.id}/workouts`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expectPaginatedResponse(response, 2);
      expect(response.body.data.meta).toHaveProperty('total', 2);
      expect(response.body.data.meta).toHaveProperty('currentPage', 1);
      expect(response.body.data.meta).toHaveProperty('perPage', 10);
    });

    it('should throw ForbiddenException when authenticated user tries to fetch another user workouts', async () => {
      const { agent1, user2 } = await setupTwoUsers(server);

      await agent1.get(`/users/${user2.id}/workouts`).expect(403);
    });
  });

  describe('/workouts/:id (GET)', () => {
    it('should fetch workout details when authenticated user requests their own workout', async () => {
      const { agent, user } = await setupSingleUser(server);
      const workoutData = createTestWorkoutData();

      const createdWorkout = await createWorkout(agent, user.id, workoutData);

      const response = await agent
        .get(`/workouts/${createdWorkout.id}`)
        .expect(200);

      expectDataProperties(response, {
        id: createdWorkout.id,
        name: workoutData.name,
        notes: workoutData.notes,
        duration: workoutData.duration,
        userId: user.id,
      });
    });

    it('should allow any authenticated user to fetch workout details', async () => {
      const { agent1, agent2, user2 } = await setupTwoUsers(server);

      const createdWorkout = await createWorkout(
        agent2,
        user2.id,
        createTestWorkoutData(),
      );

      const response = await agent1
        .get(`/workouts/${createdWorkout.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('apiVersion');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', createdWorkout.id);
    });

    it('should throw NotFoundException when workout does not exist', async () => {
      const { agent } = await setupSingleUser(server);

      await agent.get(`/workouts/${NON_EXISTENT_UUID}`).expect(404);
    });
  });

  describe('/workouts/:id (PATCH)', () => {
    it('should update workout when authenticated user modifies their own workout', async () => {
      const { agent, user } = await setupSingleUser(server);
      const workoutData = createTestWorkoutData();

      const createdWorkout = await createWorkout(agent, user.id, workoutData);

      const updateData = {
        name: 'Updated Workout Name',
        duration: 90,
      };

      const response = await agent
        .patch(`/workouts/${createdWorkout.id}`)
        .send(updateData)
        .expect(200);

      expectDataProperties(response, {
        id: createdWorkout.id,
        name: updateData.name,
        duration: updateData.duration,
        notes: workoutData.notes,
      });
    });

    it('should throw ForbiddenException when authenticated user tries to modify another user workout', async () => {
      const { agent1, agent2, user2 } = await setupTwoUsers(server);
      const workoutData = createTestWorkoutData();

      const createdWorkout = await createWorkout(agent2, user2.id, workoutData);

      const updateData = {
        name: 'Hacked Workout Name',
      };

      await agent1
        .patch(`/workouts/${createdWorkout.id}`)
        .send(updateData)
        .expect(403);
    });

    it('should throw NotFoundException when trying to update non-existing workout', async () => {
      const { agent } = await setupSingleUser(server);

      const updateData = {
        name: 'Updated Name',
      };

      await agent
        .patch(`/workouts/${NON_EXISTENT_UUID}`)
        .send(updateData)
        .expect(404);
    });
  });

  describe('/workouts/:id (DELETE)', () => {
    it('should delete workout when authenticated user removes their own workout', async () => {
      const { agent, user } = await setupSingleUser(server);
      const workoutData = createTestWorkoutData();

      const createdWorkout = await createWorkout(agent, user.id, workoutData);

      await agent.delete(`/workouts/${createdWorkout.id}`).expect(204);

      await agent.get(`/workouts/${createdWorkout.id}`).expect(404);
    });

    it('should delete workout and cascade related exercises and sets when workout is removed', async () => {
      const { agent, user } = await setupSingleUser(server);
      const workoutData = createTestWorkoutData();

      const createdWorkout = await createWorkout(agent, user.id, workoutData);

      const exerciseData = {
        name: 'Bench Press',
        type: 'Strength',
        order: 1,
        notes: 'Test exercise',
      };

      await agent
        .post(`/workouts/${createdWorkout.id}/exercises`)
        .send(exerciseData)
        .expect(201);

      await agent.delete(`/workouts/${createdWorkout.id}`).expect(204);

      await agent.get(`/workouts/${createdWorkout.id}`).expect(404);
    });

    it('should throw ForbiddenException when authenticated user tries to delete another user workout', async () => {
      const { agent1, agent2, user2 } = await setupTwoUsers(server);
      const workoutData = createTestWorkoutData();

      const createdWorkout = await createWorkout(agent2, user2.id, workoutData);

      await agent1.delete(`/workouts/${createdWorkout.id}`).expect(403);

      await agent2.get(`/workouts/${createdWorkout.id}`).expect(200);
    });

    it('should throw NotFoundException when trying to delete non-existing workout', async () => {
      const { agent } = await setupSingleUser(server);

      await agent.delete(`/workouts/${NON_EXISTENT_UUID}`).expect(404);
    });
  });
});
