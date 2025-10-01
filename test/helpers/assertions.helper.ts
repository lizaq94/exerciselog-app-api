import { Response } from 'supertest';

/**
 * Expects a standard API response structure with apiVersion and data
 *
 * @param response - Supertest response object
 */
export const expectStandardApiResponse = (response: Response): void => {
  expect(response.body).toHaveProperty('apiVersion');
  expect(response.body).toHaveProperty('data');
};

/**
 * Expects a response to have specific properties in the data field
 *
 * @param response - Supertest response object
 * @param properties - Object with property names as keys and expected values
 */
export const expectDataProperties = (
  response: Response,
  properties: Record<string, any>,
): void => {
  expectStandardApiResponse(response);

  for (const [key, value] of Object.entries(properties)) {
    if (value !== undefined) {
      expect(response.body.data).toHaveProperty(key, value);
    } else {
      expect(response.body.data).toHaveProperty(key);
    }
  }
};

/**
 * Expects data to NOT have specified properties (e.g., sensitive fields)
 *
 * @param response - Supertest response object
 * @param properties - Array of property names that should NOT exist
 */
export const expectDataNotToHaveProperties = (
  response: Response,
  properties: string[],
): void => {
  for (const property of properties) {
    expect(response.body.data).not.toHaveProperty(property);
  }
};

/**
 * Expects a paginated response structure
 *
 * @param response - Supertest response object
 * @param expectedLength - Expected number of items in data array (optional)
 */
export const expectPaginatedResponse = (
  response: Response,
  expectedLength?: number,
): void => {
  expectStandardApiResponse(response);
  expect(response.body.data).toHaveProperty('meta');
  expect(response.body.data).toHaveProperty('links');
  expect(response.body.data).toHaveProperty('data');
  expect(Array.isArray(response.body.data.data)).toBe(true);

  if (expectedLength !== undefined) {
    expect(response.body.data.data).toHaveLength(expectedLength);
  }
};

/**
 * Expects a response to contain an array in the data field
 *
 * @param response - Supertest response object
 * @param expectedLength - Expected array length (optional)
 */
export const expectArrayResponse = (
  response: Response,
  expectedLength?: number,
): void => {
  expectStandardApiResponse(response);
  expect(Array.isArray(response.body.data)).toBe(true);

  if (expectedLength !== undefined) {
    expect(response.body.data).toHaveLength(expectedLength);
  }
};
