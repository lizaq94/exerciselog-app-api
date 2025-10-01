import { CreateUserDto } from '../../src/users/dto/create-user.dto';

/**
 * Creates test user data with optional suffix for uniqueness
 */
export const createTestUserData = (suffix = ''): CreateUserDto => ({
  username: `testuser${suffix}`,
  email: `test${suffix}@example.com`,
  password: 'SecurePassword123!',
});
