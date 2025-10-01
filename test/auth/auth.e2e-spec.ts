import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestUserData } from '../fixtures';
import {
  cleanDatabase,
  setupE2ETest,
  setupSingleUser,
  teardownE2ETest,
} from '../helpers';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let server: any;
  let databaseService: any;

  const hasCookie = (response: any, cookieName: string): boolean => {
    const cookies = response.headers['set-cookie'];
    if (!cookies) return false;

    const cookieArray = Array.isArray(cookies) ? cookies : [cookies];
    return cookieArray.some((cookie: string) => cookie.includes(cookieName));
  };

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

  describe('/auth/signup (POST)', () => {
    it('should register a new user when provided with valid data', async () => {
      const userData = createTestUserData();

      const response = await request(server)
        .post('/auth/signup')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('apiVersion');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('username', userData.username);
      expect(response.body.data).toHaveProperty('email', userData.email);
      expect(response.body.data).not.toHaveProperty('password');
      expect(response.body.data).not.toHaveProperty('refreshToken');

      expect(response.headers['set-cookie']).toBeDefined();
      expect(hasCookie(response, 'Authentication')).toBe(true);
      expect(hasCookie(response, 'Refresh')).toBe(true);
    });

    it('should throw UnauthorizedException when email is already taken', async () => {
      const userData = createTestUserData();

      await request(server).post('/auth/signup').send(userData).expect(201);

      await request(server).post('/auth/signup').send(userData).expect(401);
    });

    it('should throw UnauthorizedException when username is already taken', async () => {
      const userData1 = createTestUserData('1');
      const userData2 = {
        username: userData1.username, // Same username
        email: 'different@example.com',
        password: 'SecurePassword123!',
      };

      await request(server).post('/auth/signup').send(userData1).expect(201);

      await request(server).post('/auth/signup').send(userData2).expect(401);
    });

    it('should throw validation error when provided with invalid data', async () => {
      const invalidData = {
        username: '',
        email: 'invalid-email',
        password: '123',
      };

      const response = await request(server)
        .post('/auth/signup')
        .send(invalidData)
        .expect(400);

      expect(response.body.response.message).toBeDefined();
      expect(Array.isArray(response.body.response.message)).toBe(true);
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login user when provided with valid credentials', async () => {
      const userData = createTestUserData();

      await request(server).post('/auth/signup').send(userData).expect(201);

      const response = await request(server)
        .post('/auth/login')
        .send({ email: userData.email, password: userData.password })
        .expect(200);

      expect(response.body).toHaveProperty('apiVersion');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('email', userData.email);
      expect(response.body.data).not.toHaveProperty('password');
      expect(response.body.data).not.toHaveProperty('refreshToken');

      expect(response.headers['set-cookie']).toBeDefined();
      expect(hasCookie(response, 'Authentication')).toBe(true);
      expect(hasCookie(response, 'Refresh')).toBe(true);
    });

    it('should throw UnauthorizedException when password is incorrect', async () => {
      const userData = createTestUserData();

      await request(server).post('/auth/signup').send(userData).expect(201);

      await request(server)
        .post('/auth/login')
        .send({ email: userData.email, password: 'wrongpassword' })
        .expect(401);
    });

    it('should throw UnauthorizedException when email does not exist', async () => {
      await request(server)
        .post('/auth/login')
        .send({ email: 'nonexistent@example.com', password: 'password123' })
        .expect(401);
    });

    it('should throw validation error when credentials are missing', async () => {
      await request(server).post('/auth/login').send({}).expect(400);
    });
  });

  describe('/auth/refresh (POST)', () => {
    it('should refresh access token when provided with valid refresh token', async () => {
      const { agent, user } = await setupSingleUser(server);

      const response = await agent.post('/auth/refresh').expect(200);

      expect(response.body).toHaveProperty('apiVersion');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('email', user.email);
      expect(response.body.data).not.toHaveProperty('password');
      expect(response.body.data).not.toHaveProperty('refreshToken');

      expect(response.headers['set-cookie']).toBeDefined();
      expect(hasCookie(response, 'Authentication')).toBe(true);
      expect(hasCookie(response, 'Refresh')).toBe(true);
    });

    it('should throw UnauthorizedException when refresh token is missing', async () => {
      await request(server).post('/auth/refresh').expect(401);
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      await request(server)
        .post('/auth/refresh')
        .set('Cookie', ['Refresh=invalid_token'])
        .expect(401);
    });
  });

  describe('/auth/logout (POST)', () => {
    it('should logout user and clear cookies when authenticated', async () => {
      const { agent } = await setupSingleUser(server);

      const response = await agent.post('/auth/logout').expect(204);

      expect(response.headers['set-cookie']).toBeDefined();
      expect(hasCookie(response, 'Authentication=;')).toBe(true);
      expect(hasCookie(response, 'Refresh=;')).toBe(true);
    });

    it('should throw UnauthorizedException when not authenticated', async () => {
      await request(server).post('/auth/logout').expect(401);
    });

    it('should throw UnauthorizedException when refresh token is invalid', async () => {
      await request(server)
        .post('/auth/logout')
        .set('Cookie', ['Refresh=invalid_token'])
        .expect(401);
    });
  });

  describe('Protected routes access', () => {
    it('should throw UnauthorizedException when accessing protected resource without token', async () => {
      await request(server).get('/users/me').expect(401);
    });

    it('should access protected resource when authenticated', async () => {
      const { agent, user } = await setupSingleUser(server);

      const response = await agent.get('/users/me').expect(200);

      expect(response.body).toHaveProperty('apiVersion');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('email', user.email);
      expect(response.body.data).not.toHaveProperty('password');
      expect(response.body.data).not.toHaveProperty('refreshToken');
    });

    it('should throw UnauthorizedException when using invalid access token', async () => {
      await request(server)
        .get('/users/me')
        .set('Cookie', ['Authentication=invalid_token'])
        .expect(401);
    });
  });
});
