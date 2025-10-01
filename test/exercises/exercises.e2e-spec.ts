import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DatabaseService } from '../../src/database/database.service';
import { CreateUserDto } from '../../src/users/dto/create-user.dto';
import { CreateWorkoutDto } from '../../src/workouts/dtos/create-workout.dto';
import { CreateExerciseDto } from '../../src/exercises/dto/create-exercise.dto';
import { UpdateExerciseDto } from '../../src/exercises/dto/update-exercise.dto';
import { createApp } from '../../src/app.create';
import { loginUser } from '../utilis/login-user.util';

describe('ExercisesController (e2e)', () => {
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

  const createExercise = async (
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

  const createTestExerciseData = (suffix = ''): CreateExerciseDto => ({
    name: `Bench Press${suffix}`,
    order: 1,
    type: 'Strength',
    notes: `Exercise notes${suffix}`,
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

  describe('/workouts/:id/exercises (POST)', () => {
    it('should add exercise to own workout when authenticated user provides valid data', async () => {
      const userData = createTestUserData();
      const { agent, user } = await loginUser(server, userData);
      const workoutData = createTestWorkoutData();

      const workout = await createWorkout(agent, user.id, workoutData);
      const exerciseData = createTestExerciseData();

      const response = await agent
        .post(`/workouts/${workout.id}/exercises`)
        .send(exerciseData)
        .expect(201);
      expect(response.body).toHaveProperty('apiVersion');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('name', exerciseData.name);
      expect(response.body.data).toHaveProperty('notes', exerciseData.notes);
      expect(response.body.data).toHaveProperty('type', exerciseData.type);
      expect(response.body.data).toHaveProperty('order', exerciseData.order);
      expect(response.body.data).toHaveProperty('workoutId', workout.id);
      expect(response.body.data).toHaveProperty('createdAt');
    });

    it('should throw ForbiddenException when trying to add exercise to another users workout', async () => {
      const userData1 = createTestUserData('1');
      const userData2 = createTestUserData('2');
      const workoutData = createTestWorkoutData();

      const { agent: agent1 } = await loginUser(server, userData1);
      const { agent: agent2, user: user2 } = await loginUser(server, userData2);

      const workout = await createWorkout(agent2, user2.id, workoutData);
      const exerciseData = createTestExerciseData();

      await agent1
        .post(`/workouts/${workout.id}/exercises`)
        .send(exerciseData)
        .expect(403);
    });

    it('should throw NotFoundException when trying to add exercise to non-existent workout', async () => {
      const userData = createTestUserData();
      const { agent } = await loginUser(server, userData);

      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      const exerciseData = createTestExerciseData();
      await agent
        .post(`/workouts/${nonExistentId}/exercises`)
        .send(exerciseData)
        .expect(404);
    });

    it('should throw UnauthorizedException when unauthenticated user tries to add exercise', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      const exerciseData = createTestExerciseData();

      await request(server)
        .post(`/workouts/${nonExistentId}/exercises`)
        .send(exerciseData)
        .expect(401);
    });

    it('should throw validation error when provided with invalid exercise data', async () => {
      const userData = createTestUserData();
      const { agent, user } = await loginUser(server, userData);
      const workoutData = createTestWorkoutData();

      const workout = await createWorkout(agent, user.id, workoutData);

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
      const userData = createTestUserData();
      const { agent, user } = await loginUser(server, userData);
      const workoutData = createTestWorkoutData();

      const workout = await createWorkout(agent, user.id, workoutData);
      const exercise = await createExercise(
        agent,
        workout.id,
        createTestExerciseData(),
      );

      const response = await agent.get(`/exercises/${exercise.id}`).expect(200);

      expect(response.body).toHaveProperty('apiVersion');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', exercise.id);
      expect(response.body.data).toHaveProperty('name', exercise.name);
    });

    it('should throw NotFoundException when trying to retrieve non-existent exercise', async () => {
      const userData = createTestUserData();
      const { agent } = await loginUser(server, userData);

      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      await agent.get(`/exercises/${nonExistentId}`).expect(404);
    });

    it('should throw UnauthorizedException when unauthenticated user tries to retrieve exercise', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      await request(server).get(`/exercises/${nonExistentId}`).expect(401);
    });
  });

  describe('/exercises/:id (PATCH)', () => {
    it('should update own exercise when authenticated user provides valid data', async () => {
      const userData = createTestUserData();
      const { agent, user } = await loginUser(server, userData);
      const workoutData = createTestWorkoutData();

      const workout = await createWorkout(agent, user.id, workoutData);
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

      expect(response.body).toHaveProperty('apiVersion');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', exercise.id);
      expect(response.body.data).toHaveProperty('name', updateData.name);
      expect(response.body.data).toHaveProperty('notes', updateData.notes);
    });

    it('should throw ForbiddenException when trying to update another users exercise', async () => {
      const userData1 = createTestUserData('1');
      const userData2 = createTestUserData('2');
      const workoutData = createTestWorkoutData();

      const { agent: agent1 } = await loginUser(server, userData1);
      const { agent: agent2, user: user2 } = await loginUser(server, userData2);

      const workout = await createWorkout(agent2, user2.id, workoutData);
      const exercise = await createExercise(
        agent2,
        workout.id,
        createTestExerciseData(),
      );

      const updateData: UpdateExerciseDto = {
        name: 'Malicious Update',
      };

      await agent1
        .patch(`/exercises/${exercise.id}`)
        .send(updateData)
        .expect(403);
    });

    it('should throw NotFoundException when trying to update non-existent exercise', async () => {
      const userData = createTestUserData();
      const { agent } = await loginUser(server, userData);

      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      const updateData: UpdateExerciseDto = {
        name: 'Updated Name',
      };

      await agent
        .patch(`/exercises/${nonExistentId}`)
        .send(updateData)
        .expect(404);
    });

    it('should throw UnauthorizedException when unauthenticated user tries to update exercise', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      const updateData: UpdateExerciseDto = {
        name: 'Updated Name',
      };

      await request(server)
        .patch(`/exercises/${nonExistentId}`)
        .send(updateData)
        .expect(401);
    });

    it('should throw validation error when provided with invalid update data', async () => {
      const userData = createTestUserData();
      const { agent, user } = await loginUser(server, userData);
      const workoutData = createTestWorkoutData();

      const workout = await createWorkout(agent, user.id, workoutData);
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
      const userData = createTestUserData();
      const { agent, user } = await loginUser(server, userData);
      const workoutData = createTestWorkoutData();

      const workout = await createWorkout(agent, user.id, workoutData);
      const exercise = await createExercise(
        agent,
        workout.id,
        createTestExerciseData(),
      );

      await agent.delete(`/exercises/${exercise.id}`).expect(204);

      await agent.get(`/exercises/${exercise.id}`).expect(404);
    });

    it('should throw ForbiddenException when trying to delete another users exercise', async () => {
      const userData1 = createTestUserData('1');
      const userData2 = createTestUserData('2');
      const workoutData = createTestWorkoutData();

      const { agent: agent1 } = await loginUser(server, userData1);
      const { agent: agent2, user: user2 } = await loginUser(server, userData2);

      const workout = await createWorkout(agent2, user2.id, workoutData);
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
      const userData = createTestUserData();
      const { agent } = await loginUser(server, userData);

      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      await agent.delete(`/exercises/${nonExistentId}`).expect(404);
    });

    it('should throw UnauthorizedException when unauthenticated user tries to delete exercise', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      await request(server).delete(`/exercises/${nonExistentId}`).expect(401);
    });
  });

  describe('/workouts/:id/exercises (GET)', () => {
    it('should retrieve all exercises for own workout when authenticated', async () => {
      const userData = createTestUserData();
      const { agent, user } = await loginUser(server, userData);
      const workoutData = createTestWorkoutData();

      const workout = await createWorkout(agent, user.id, workoutData);
      await createExercise(agent, workout.id, createTestExerciseData('1'));
      await createExercise(agent, workout.id, createTestExerciseData('2'));

      const response = await agent
        .get(`/workouts/${workout.id}/exercises`)
        .expect(200);

      expect(response.body).toHaveProperty('apiVersion');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(2);
    });

    it('should throw NotFoundException when trying to retrieve exercises from non-existent workout', async () => {
      const userData = createTestUserData();
      const { agent } = await loginUser(server, userData);

      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      await agent.get(`/workouts/${nonExistentId}/exercises`).expect(404);
    });

    it('should throw UnauthorizedException when unauthenticated user tries to retrieve exercises', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      await request(server)
        .get(`/workouts/${nonExistentId}/exercises`)
        .expect(401);
    });
  });
});
