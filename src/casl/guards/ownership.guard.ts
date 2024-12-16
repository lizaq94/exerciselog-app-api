import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { Action, CaslAbilityFactory } from '../casl-ability.factory';
import { RESOURCE_TYPE_KEY } from '../decorators/resource-type.decorator';
import { Resource } from '../types/resource.type';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
    private moduleRef: ModuleRef,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Nie znaleziono użytkownika');
    }

    const ability = this.caslAbilityFactory.defineAbility(user);
    const resourceId = request.params.id;
    const resourceType = this.reflector.get<Resource>(
      RESOURCE_TYPE_KEY,
      context.getHandler(),
    );

    if (!resourceType) {
      throw new Error('The resource type is not specified in the metadata.');
    }

    let resource;
    switch (resourceType) {
      case Resource.WORKOUT:
        resource = await this.moduleRef
          .get('WorkoutsService')
          .findOne(resourceId);
        break;
      case Resource.EXERCISE:
        resource = await this.moduleRef
          .get('ExercisesService')
          .findOne(resourceId);
        break;
      case Resource.SET:
        resource = await this.moduleRef.get('SetsService').findOne(resourceId);
        break;
      default:
        throw new ForbiddenException('Invalid resource type.');
    }

    if (resource && ability.can(Action.Manage, resource)) {
      return true;
    }

    throw new ForbiddenException('No permission to manage the resource.');
  }
}
