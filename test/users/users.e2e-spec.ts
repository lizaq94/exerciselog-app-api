import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import {
  cleanUserData,
  expectDataNotToHaveProperties,
  expectDataProperties,
  setupE2ETest,
  setupSingleUser,
  setupTwoUsers,
  teardownE2ETest,
} from '../helpers';

describe('UsersController (e2e)', () => {
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
    await cleanUserData(databaseService);
  });

  afterAll(async () => {
    await cleanUserData(databaseService);
    await teardownE2ETest(app);
  });

  describe('/users/me (GET)', () => {
    it('should get own user data when authenticated user requests their own profile', async () => {
      const { agent, user, userData } = await setupSingleUser(server);

      const response = await agent.get(`/users/me`).expect(200);

      expectDataProperties(response, {
        id: user.id,
        username: userData.username,
        email: userData.email,
      });
    });

    it('should throw Not Found when users is not log in', async () => {
      await request.agent(server).get(`/users/me}`).expect(404);
    });
  });

  describe('/users/:id (PATCH)', () => {
    it('should update own user data when authenticated user updates their profile', async () => {
      const { agent, user, userData } = await setupSingleUser(server);

      const updateData = {
        username: 'updatedusername',
      };

      const response = await agent
        .patch(`/users/${user.id}`)
        .send(updateData)
        .expect(200);

      expectDataProperties(response, {
        id: user.id,
        username: updateData.username,
        email: userData.email,
      });
      expectDataNotToHaveProperties(response, ['password', 'refreshToken']);
    });

    it('should throw ForbiddenException when authenticated user tries to update another user data', async () => {
      const { agent1, user2 } = await setupTwoUsers(server);

      await agent1
        .patch(`/users/${user2.id}`)
        .send({ username: 'hackedusername' })
        .expect(403);
    });
  });

  describe('/users/:id (DELETE)', () => {
    it('should throw ForbiddenException when authenticated user tries to delete another user', async () => {
      const { agent1, user2 } = await setupTwoUsers(server);

      await agent1.delete(`/users/${user2.id}`).expect(403);
    });
  });
});
