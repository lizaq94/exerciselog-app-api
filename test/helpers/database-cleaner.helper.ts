import { DatabaseService } from '../../src/database/database.service';

/**
 * Default entities to clean in full cleanup
 */
const DEFAULT_ENTITIES = ['upload', 'set', 'exercise', 'workout', 'user'];

/**
 * Cleans the database by deleting all records from specified entities
 *
 * @param databaseService - The database service instance
 * @param entities - Array of entity names to clean (defaults to all entities in correct order)
 */
export const cleanDatabase = async (
  databaseService: DatabaseService,
  entities: string[] = DEFAULT_ENTITIES,
): Promise<void> => {
  for (const entity of entities) {
    if (
      databaseService[entity] &&
      typeof databaseService[entity].deleteMany === 'function'
    ) {
      await databaseService[entity].deleteMany({});
    }
  }
};

/**
 * Cleans only user-related data (minimal cleanup)
 */
export const cleanUserData = async (
  databaseService: DatabaseService,
): Promise<void> => {
  await cleanDatabase(databaseService, ['upload', 'user']);
};
