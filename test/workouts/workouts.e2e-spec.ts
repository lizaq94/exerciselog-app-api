import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';

import { AppModule } from '../../src/app.module';
import { DatabaseService } from '../../src/database/database.service';
import { CreateUserDto } from '../../src/users/dto/create-user.dto';
import { CreateWorkoutDto } from '../../src/workouts/dtos/create-workout.dto';
import { createApp } from '../../src/app.create';
import { loginUser } from '../utilis/login-user.util';

describe('WorkoutsController (e2e)', () => {
  let app: INestApplication;
  let server: any;
  let databaseService: DatabaseService;

  const cleanDatabase = async () => {
    await databaseService.set.deleteMany({});
    await databaseService.exercise.deleteMany({});
    await databaseService.workout.deleteMany({});
    await databaseService.upload.deleteMany({});
    await databaseService.user.deleteMany({});
  };

  const createWorkout = async (
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

  const createTestUserData = (suffix = ''): CreateUserDto => ({
    username: `testuser${suffix}`,
    email: `test${suffix}@example.com`,
    password: 'SecurePassword123!',
  });

  const createTestWorkoutData = (suffix = ''): CreateWorkoutDto => ({
    name: `Morning Workout${suffix}`,
    notes: `Test workout notes${suffix}`,
    duration: 60,
  });

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    createApp(app);

    await app.init();
    server = app.getHttpServer();
    databaseService = moduleFixture.get<DatabaseService>(DatabaseService);
  });

  beforeEach(async () => {
    await cleanDatabase();
  });

  afterAll(async () => {
    await cleanDatabase();
    await app.close();
  });

  describe('/users/:id/workouts (POST)', () => {
    it('should register a new workout when authenticated user creates workout for themselves', async () => {
      const userData = createTestUserData();
      const { agent, user } = await loginUser(server, userData);
      const workoutData = createTestWorkoutData();

      const response = await agent
        .post(`/users/${user.id}/workouts`)
        .send(workoutData)
        .expect(201);

      expect(response.body).toHaveProperty('apiVersion');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name', workoutData.name);
      expect(response.body.data).toHaveProperty('notes', workoutData.notes);
      expect(response.body.data).toHaveProperty(
        'duration',
        workoutData.duration,
      );
      expect(response.body.data).toHaveProperty('userId', user.id);
      expect(response.body.data).toHaveProperty('createdAt');
      expect(response.body.data).toHaveProperty('updatedAt');
    });

    it('should throw ForbiddenException when authenticated user tries to create workout for another user', async () => {
      const userData1 = createTestUserData('1');
      const userData2 = createTestUserData('2');
      const workoutData = createTestWorkoutData();

      const { agent: agent1 } = await loginUser(server, userData1);
      const { user: user2 } = await loginUser(server, userData2);

      await agent1
        .post(`/users/${user2.id}/workouts`)
        .send(workoutData)
        .expect(403);
    });
  });

  describe('/users/:id/workouts (GET)', () => {
    it('should fetch paginated list of workouts when authenticated user requests their own workouts', async () => {
      const userData = createTestUserData();
      const { agent, user } = await loginUser(server, userData);

      // Create two workouts for the test
      const workoutData1 = createTestWorkoutData('1');
      const workoutData2 = createTestWorkoutData('2');

      await createWorkout(agent, user.id, workoutData1);
      await createWorkout(agent, user.id, workoutData2);

      const response = await agent
        .get(`/users/${user.id}/workouts`)
        .query({ page: 1, limit: 10 })
        .expect(200);

      expect(response.body).toHaveProperty('apiVersion');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('meta');
      expect(response.body.data).toHaveProperty('links');
      expect(response.body.data).toHaveProperty('data');
      expect(Array.isArray(response.body.data.data)).toBe(true);
      expect(response.body.data.data).toHaveLength(2);
      expect(response.body.data.meta).toHaveProperty('total', 2);
      expect(response.body.data.meta).toHaveProperty('currentPage', 1);
      expect(response.body.data.meta).toHaveProperty('perPage', 10);
    });

    it('should throw ForbiddenException when authenticated user tries to fetch another user workouts', async () => {
      const userData1 = createTestUserData('1');
      const userData2 = createTestUserData('2');

      const { agent: agent1 } = await loginUser(server, userData1);
      const { user: user2 } = await loginUser(server, userData2);

      await agent1.get(`/users/${user2.id}/workouts`).expect(403);
    });
  });

  describe('/workouts/:id (GET)', () => {
    it('should fetch workout details when authenticated user requests their own workout', async () => {
      const userData = createTestUserData();
      const { agent, user } = await loginUser(server, userData);
      const workoutData = createTestWorkoutData();

      const createdWorkout = await createWorkout(agent, user.id, workoutData);

      const response = await agent
        .get(`/workouts/${createdWorkout.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('apiVersion');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', createdWorkout.id);
      expect(response.body.data).toHaveProperty('name', workoutData.name);
      expect(response.body.data).toHaveProperty('notes', workoutData.notes);
      expect(response.body.data).toHaveProperty(
        'duration',
        workoutData.duration,
      );
      expect(response.body.data).toHaveProperty('userId', user.id);
    });

    it('should allow any authenticated user to fetch workout details', async () => {
      const userData1 = createTestUserData('1');
      const userData2 = createTestUserData('2');
      const workoutData = createTestWorkoutData();

      const { agent: agent1 } = await loginUser(server, userData1);
      const { agent: agent2, user: user2 } = await loginUser(server, userData2);

      const createdWorkout = await createWorkout(agent2, user2.id, workoutData);

      const response = await agent1
        .get(`/workouts/${createdWorkout.id}`)
        .expect(200);

      expect(response.body).toHaveProperty('apiVersion');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', createdWorkout.id);
    });

    it('should throw NotFoundException when workout does not exist', async () => {
      const userData = createTestUserData();
      const { agent } = await loginUser(server, userData);
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      await agent.get(`/workouts/${nonExistentId}`).expect(404);
    });
  });

  describe('/workouts/:id (PATCH)', () => {
    it('should update workout when authenticated user modifies their own workout', async () => {
      const userData = createTestUserData();
      const { agent, user } = await loginUser(server, userData);
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

      expect(response.body).toHaveProperty('apiVersion');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', createdWorkout.id);
      expect(response.body.data).toHaveProperty('name', updateData.name);
      expect(response.body.data).toHaveProperty(
        'duration',
        updateData.duration,
      );
      expect(response.body.data).toHaveProperty('notes', workoutData.notes);
    });

    it('should throw ForbiddenException when authenticated user tries to modify another user workout', async () => {
      const userData1 = createTestUserData('1');
      const userData2 = createTestUserData('2');
      const workoutData = createTestWorkoutData();

      const { agent: agent1 } = await loginUser(server, userData1);
      const { agent: agent2, user: user2 } = await loginUser(server, userData2);

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
      const userData = createTestUserData();
      const { agent } = await loginUser(server, userData);
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      const updateData = {
        name: 'Updated Name',
      };

      await agent
        .patch(`/workouts/${nonExistentId}`)
        .send(updateData)
        .expect(404);
    });
  });

  describe('/workouts/:id (DELETE)', () => {
    it('should delete workout when authenticated user removes their own workout', async () => {
      const userData = createTestUserData();
      const { agent, user } = await loginUser(server, userData);
      const workoutData = createTestWorkoutData();

      const createdWorkout = await createWorkout(agent, user.id, workoutData);

      await agent.delete(`/workouts/${createdWorkout.id}`).expect(204);

      await agent.get(`/workouts/${createdWorkout.id}`).expect(404);
    });

    it('should delete workout and cascade related exercises and sets when workout is removed', async () => {
      const userData = createTestUserData();
      const { agent, user } = await loginUser(server, userData);
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
      const userData1 = createTestUserData('1');
      const userData2 = createTestUserData('2');
      const workoutData = createTestWorkoutData();

      const { agent: agent1 } = await loginUser(server, userData1);
      const { agent: agent2, user: user2 } = await loginUser(server, userData2);

      const createdWorkout = await createWorkout(agent2, user2.id, workoutData);

      await agent1.delete(`/workouts/${createdWorkout.id}`).expect(403);

      await agent2.get(`/workouts/${createdWorkout.id}`).expect(200);
    });

    it('should throw NotFoundException when trying to delete non-existing workout', async () => {
      const userData = createTestUserData();
      const { agent } = await loginUser(server, userData);
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      await agent.delete(`/workouts/${nonExistentId}`).expect(404);
    });
  });
});
