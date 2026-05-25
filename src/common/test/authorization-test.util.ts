import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Action } from '../../casl/casl-ability.factory';
import { OwnershipGuard } from '../../casl/guards/ownership.guard';
import { Resource } from '../../casl/types/resource.type';
import { DatabaseService } from '../../database/database.service';

/**
 * Universal test function to verify ForbiddenException functionality
 * in controllers with OwnershipGuard
 *
 * @param operation - Controller function to test
 * @param id - Resource ID
 * @param serviceName - Deprecated/unused; kept for backward compatibility with existing call sites
 * @param mockService - Deprecated/unused; kept for backward compatibility with existing call sites
 * @param resourceType - Resource type from Resource enum
 * @param dto - Optional data for operations that require DTO
 * @returns Promise<void>
 */
export const testForbiddenException = async (
  operation: (id: string, dto?: any) => Promise<any>,
  id: string,
  serviceName: any,
  mockService: any,
  resourceType: Resource,
  dto?: any,
) => {
  const testUser = { id: 'user-1234', sets: [] };
  const anotherUserResource = {
    id,
    userId: 'different-user-id',
  };

  const findUnique = jest.fn().mockResolvedValue(anotherUserResource);
  const mockDatabaseService = {
    [resourceType.toLowerCase()]: { findUnique },
  };

  const mockAbility = { can: jest.fn().mockReturnValue(false) };
  const caslAbilityFactory = {
    defineAbility: jest.fn().mockReturnValue(mockAbility),
  };

  const mockExecutionContext = {
    switchToHttp: jest.fn().mockReturnValue({
      getRequest: jest.fn().mockReturnValue({
        user: testUser,
        params: { id },
      }),
    }),
    getHandler: jest.fn(),
  };

  const mockReflector = new Reflector();
  jest.spyOn(mockReflector, 'get').mockReturnValue(resourceType);

  const ownershipGuard = new OwnershipGuard(
    mockReflector,
    caslAbilityFactory,
    mockDatabaseService as unknown as DatabaseService,
  );

  await expect(async () => {
    const canActivate = await ownershipGuard.canActivate(
      mockExecutionContext as any,
    );
    if (!canActivate) {
      throw new ForbiddenException('No permission to manage the resource.');
    }
    return dto ? operation(id, dto) : operation(id);
  }).rejects.toThrow(ForbiddenException);

  expect(findUnique).toHaveBeenCalledWith({ where: { id } });
  expect(caslAbilityFactory.defineAbility).toHaveBeenCalledWith(testUser);
  expect(mockAbility.can).toHaveBeenCalledWith(
    Action.Manage,
    expect.any(Object),
  );
};
