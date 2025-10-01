import { loginUser } from '../utilis/login-user.util';
import { createTestUserData } from '../fixtures';

/**
 * Sets up a single authenticated user for testing
 *
 * @param server - Express server instance
 * @param suffix - Optional suffix for user uniqueness
 * @returns Object containing agent and user data
 */
export const setupSingleUser = async (server: any, suffix = '') => {
  const userData = createTestUserData(suffix);
  const { agent, user } = await loginUser(server, userData);

  return { agent, user, userData };
};

/**
 * Sets up two authenticated users for testing authorization scenarios
 *
 * @param server - Express server instance
 * @returns Object containing both agents and user data
 */
export const setupTwoUsers = async (server: any) => {
  const userData1 = createTestUserData('1');
  const userData2 = createTestUserData('2');

  const { agent: agent1, user: user1 } = await loginUser(server, userData1);
  const { agent: agent2, user: user2 } = await loginUser(server, userData2);

  return {
    agent1,
    user1,
    userData1,
    agent2,
    user2,
    userData2,
  };
};

/**
 * Sets up multiple authenticated users
 *
 * @param server - Express server instance
 * @param count - Number of users to create
 * @returns Array of objects containing agent and user data
 */
export const setupMultipleUsers = async (server: any, count: number) => {
  const users = [];

  for (let i = 0; i < count; i++) {
    const userData = createTestUserData(`${i + 1}`);
    const { agent, user } = await loginUser(server, userData);
    users.push({ agent, user, userData });
  }

  return users;
};
