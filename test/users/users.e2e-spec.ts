import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../src/app.module';
import { DatabaseService } from '../../src/database/database.service';
import { CreateUserDto } from '../../src/users/dto/create-user.dto';
import { createApp } from '../../src/app.create';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let server: any;
  let databaseService: DatabaseService;

  const cleanDatabase = async () => {
    await databaseService.upload.deleteMany({});
    await databaseService.user.deleteMany({});
  };

  const loginUser = async (userData: CreateUserDto) => {
    const agent = request.agent(server);

    await agent.post('/auth/signup').send(userData).expect(201);

    const loginResponse = await agent
      .post('/auth/login')
      .send({ email: userData.email, password: userData.password })
      .expect(200);

    return { agent, user: loginResponse.body.data };
  };

  const createTestUserData = (suffix = ''): CreateUserDto => ({
    username: `testuser${suffix}`,
    email: `test${suffix}@example.com`,
    password: 'SecurePassword123!',
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

  describe('/users/me (GET)', () => {
    it('should get own user data when authenticated user requests their own profile', async () => {
      const userData = createTestUserData();
      const { agent, user } = await loginUser(userData);

      const response = await agent.get(`/users/me`).expect(200);

      expect(response.body).toHaveProperty('apiVersion');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', user.id);
      expect(response.body.data).toHaveProperty('username', userData.username);
      expect(response.body.data).toHaveProperty('email', userData.email);
    });

    it('should throw Not Found when users is not log in', async () => {
      await request.agent(server).get(`/users/me}`).expect(404);
    });
  });

  describe('/users/:id (PATCH)', () => {
    it('should update own user data when authenticated user updates their profile', async () => {
      const userData = createTestUserData();
      const { agent, user } = await loginUser(userData);

      const updateData = {
        username: 'updatedusername',
      };

      const response = await agent
        .patch(`/users/${user.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('apiVersion');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id', user.id);
      expect(response.body.data).toHaveProperty(
        'username',
        updateData.username,
      );
      expect(response.body.data).toHaveProperty('email', userData.email);
      expect(response.body.data).not.toHaveProperty('password');
      expect(response.body.data).not.toHaveProperty('refreshToken');
    });

    it('should throw ForbiddenException when authenticated user tries to update another user data', async () => {
      const userData1 = createTestUserData('1');
      const userData2 = createTestUserData('2');

      const { agent: agent1 } = await loginUser(userData1);
      const { user: user2 } = await loginUser(userData2);

      const updateData = {
        username: 'hackedusername',
      };

      await agent1.patch(`/users/${user2.id}`).send(updateData).expect(403);
    });
  });

  describe('/users/:id (DELETE)', () => {
    it('should throw ForbiddenException when authenticated user tries to delete another user', async () => {
      const userData1 = createTestUserData('1');
      const userData2 = createTestUserData('2');

      const { agent: agent1 } = await loginUser(userData1);
      const { user: user2 } = await loginUser(userData2);

      await agent1.delete(`/users/${user2.id}`).expect(403);
    });
  });
});
