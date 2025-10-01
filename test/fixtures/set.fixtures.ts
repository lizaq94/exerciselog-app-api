import { CreateSetDto } from '../../src/sets/dto/create-set.dto';

/**
 * Creates test set data with a configurable order
 */
export const createTestSetData = (order = 1): CreateSetDto => ({
  order: order,
  repetitions: 10,
  weight: 80.5,
});
