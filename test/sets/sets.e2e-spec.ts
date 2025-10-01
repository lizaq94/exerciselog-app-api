import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DatabaseService } from '../../src/database/database.service';
import { CreateUserDto } from '../../src/users/dto/create-user.dto';
import { CreateWorkoutDto } from '../../src/workouts/dtos/create-workout.dto';
import { CreateExerciseDto } from '../../src/exercises/dto/create-exercise.dto';
import { CreateSetDto } from '../../src/sets/dto/create-set.dto';
import { UpdateSetDto } from '../../src/sets/dto/update-set.dto';
import { createApp } from '../../src/app.create';
import { loginUser } from '../utilis/login-user.util';

describe('SetsController (e2e)', () => {
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

  const createSet = async (
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

  const createTestSetData = (order = 1): CreateSetDto => ({
    order: order,
    repetitions: 10,
    weight: 80.5,
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

  describe('/exercises/:id/sets (POST)', () => {
    it('should add set to own exercise when authenticated user provides valid data', async () => {
      const userData = createTestUserData();
      const { agent, user } = await loginUser(server, userData);
      const workoutData = createTestWorkoutData();

      const workout = await createWorkout(agent, user.id, workoutData);
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

      expect(response.body).toHaveProperty('apiVersion');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty(
        'repetitions',
        setData.repetitions,
      );
      expect(response.body.data).toHaveProperty('weight', setData.weight);
      expect(response.body.data).toHaveProperty('order', setData.order);
      expect(response.body.data).toHaveProperty('exerciseId', exercise.id);
    });

    it('should throw ForbiddenException when trying to add set to another users exercise', async () => {
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
      const setData = createTestSetData();

      await agent1
        .post(`/exercises/${exercise.id}/sets`)
        .send(setData)
        .expect(403);
    });

    it('should throw NotFoundException when trying to add set to non-existent exercise', async () => {
      const userData = createTestUserData();
      const { agent } = await loginUser(server, userData);

      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      const setData = createTestSetData();

      await agent
        .post(`/exercises/${nonExistentId}/sets`)
        .send(setData)
        .expect(404);
    });

    it('should throw UnauthorizedException when unauthenticated user tries to add set', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      const setData = createTestSetData();

      await request(server)
        .post(`/exercises/${nonExistentId}/sets`)
        .send(setData)
        .expect(401);
    });

    it('should throw validation error when provided with invalid set data', async () => {
      const userData = createTestUserData();
      const { agent, user } = await loginUser(server, userData);
      const workoutData = createTestWorkoutData();

      const workout = await createWorkout(agent, user.id, workoutData);
      const exercise = await createExercise(
        agent,
        workout.id,
        createTestExerciseData(),
      );

      const invalidSetData = {
        repetitions: 10,
        weight: -5,
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
      const userData = createTestUserData();
      const { agent, user } = await loginUser(server, userData);
      const workoutData = createTestWorkoutData();

      const workout = await createWorkout(agent, user.id, workoutData);
      const exercise = await createExercise(
        agent,
        workout.id,
        createTestExerciseData(),
      );
      const set = await createSet(agent, exercise.id, createTestSetData());

      const response = await agent.get(`/sets/${set.id}`).expect(200);

      expect(response.body).toHaveProperty('apiVersion');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', set.id);
      expect(response.body.data).toHaveProperty('repetitions', set.repetitions);
      expect(response.body.data).toHaveProperty('weight', set.weight);
    });

    it('should throw NotFoundException when trying to retrieve non-existent set', async () => {
      const userData = createTestUserData();
      const { agent } = await loginUser(server, userData);

      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      await agent.get(`/sets/${nonExistentId}`).expect(404);
    });

    it('should throw UnauthorizedException when unauthenticated user tries to retrieve set', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      await request(server).get(`/sets/${nonExistentId}`).expect(401);
    });
  });

  describe('/sets/:id (PATCH)', () => {
    it('should update own set when authenticated user provides valid data', async () => {
      const userData = createTestUserData();
      const { agent, user } = await loginUser(server, userData);
      const workoutData = createTestWorkoutData();

      const workout = await createWorkout(agent, user.id, workoutData);
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

      expect(response.body).toHaveProperty('apiVersion');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', set.id);
      expect(response.body.data).toHaveProperty(
        'repetitions',
        updateData.repetitions,
      );
      expect(response.body.data).toHaveProperty('weight', updateData.weight);
    });

    it('should throw ForbiddenException when trying to update another users set', async () => {
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
      const set = await createSet(agent2, exercise.id, createTestSetData());

      const updateData: UpdateSetDto = {
        repetitions: 20,
      };

      await agent1.patch(`/sets/${set.id}`).send(updateData).expect(403);
    });

    it('should throw NotFoundException when trying to update non-existent set', async () => {
      const userData = createTestUserData();
      const { agent } = await loginUser(server, userData);

      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      const updateData: UpdateSetDto = {
        repetitions: 15,
      };

      await agent.patch(`/sets/${nonExistentId}`).send(updateData).expect(404);
    });

    it('should throw UnauthorizedException when unauthenticated user tries to update set', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';
      const updateData: UpdateSetDto = {
        repetitions: 15,
      };

      await request(server)
        .patch(`/sets/${nonExistentId}`)
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
      const set = await createSet(agent, exercise.id, createTestSetData());

      const invalidUpdateData = {
        weight: -10,
      };

      await agent.patch(`/sets/${set.id}`).send(invalidUpdateData).expect(400);
    });
  });

  describe('/sets/:id (DELETE)', () => {
    it('should delete own set when authenticated user provides valid id', async () => {
      const userData = createTestUserData();
      const { agent, user } = await loginUser(server, userData);
      const workoutData = createTestWorkoutData();

      const workout = await createWorkout(agent, user.id, workoutData);
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
      const set = await createSet(agent2, exercise.id, createTestSetData());

      await agent1.delete(`/sets/${set.id}`).expect(403);

      const verifyResponse = await agent2.get(`/sets/${set.id}`).expect(200);
      expect(verifyResponse.body.data).toHaveProperty('id', set.id);
    });

    it('should throw NotFoundException when trying to delete non-existent set', async () => {
      const userData = createTestUserData();
      const { agent } = await loginUser(server, userData);

      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      await agent.delete(`/sets/${nonExistentId}`).expect(404);
    });

    it('should throw UnauthorizedException when unauthenticated user tries to delete set', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      await request(server).delete(`/sets/${nonExistentId}`).expect(401);
    });
  });

  describe('/exercises/:id/sets (GET)', () => {
    it('should retrieve all sets for own exercise when authenticated', async () => {
      const userData = createTestUserData();
      const { agent, user } = await loginUser(server, userData);
      const workoutData = createTestWorkoutData();

      const workout = await createWorkout(agent, user.id, workoutData);
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

      expect(response.body).toHaveProperty('apiVersion');
      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(3);
    }, 15000);

    it('should throw NotFoundException when trying to retrieve sets from non-existent exercise', async () => {
      const userData = createTestUserData();
      const { agent } = await loginUser(server, userData);

      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      await agent.get(`/exercises/${nonExistentId}/sets`).expect(404);
    });

    it('should throw UnauthorizedException when unauthenticated user tries to retrieve sets', async () => {
      const nonExistentId = '123e4567-e89b-12d3-a456-426614174000';

      await request(server).get(`/exercises/${nonExistentId}/sets`).expect(401);
    });
  });
});
