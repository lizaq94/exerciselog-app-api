import * as request from 'supertest';
import { CreateUserDto } from '../../src/users/dto/create-user.dto';

export const loginUser = async (server: any, userData: CreateUserDto) => {
  const agent = request.agent(server);

  await agent.post('/auth/signup').send(userData).expect(201);

  const loginResponse = await agent
    .post('/auth/login')
    .send({ email: userData.email, password: userData.password })
    .expect(200);

  return { agent, user: loginResponse.body.data };
};
