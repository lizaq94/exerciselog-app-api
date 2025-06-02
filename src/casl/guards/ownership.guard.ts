import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import { WorkoutsService } from '../../workouts/workouts.service';
import { ExercisesService } from '../../exercises/exercises.service';
import { SetsService } from '../../sets/sets.service';
import { Action, CaslAbilityFactory } from '../casl-ability.factory';
import { RESOURCE_TYPE_KEY } from '../decorators/resource-type.decorator';
import { Resource } from '../types/resource.type';
import { WorkoutEntity } from '../../workouts/entities/workout.entity';
import { ExerciseEntity } from '../../exercises/entities/exercise.entity';
import { SetEntity } from '../../sets/entities/set.entity';
import { UsersService } from '../../users/users.service';
import { UserEntity } from '../../users/entities/user.entity';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
    private moduleRef: ModuleRef,
  ) {}

  private entityMap = {
    [Resource.WORKOUT]: WorkoutEntity,
    [Resource.EXERCISE]: ExerciseEntity,
    [Resource.SET]: SetEntity,
    [Resource.USER]: UserEntity,
  };

  private async getService(serviceName: string) {
    switch (serviceName) {
      case Resource.WORKOUT:
        return this.moduleRef.resolve(WorkoutsService);
      case Resource.EXERCISE:
        return this.moduleRef.resolve(ExercisesService);
      case Resource.SET:
        return this.moduleRef.resolve(SetsService);
      case Resource.USER:
        return this.moduleRef.resolve(UsersService);
      default:
        throw new ForbiddenException('Invalid resource type.');
    }
  }

  private toEntity(resource: any, resourceType: Resource) {
    const EntityClass = this.entityMap[resourceType];
    if (!EntityClass) {
      throw new Error(`Entity type ${resourceType} is not recognized.`);
    }
    return Object.assign(new EntityClass(), resource);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not found');
    }

    const ability = this.caslAbilityFactory.defineAbility(user);
    const resourceId = request.params.id;
    const resourceType = this.reflector.get<Resource>(
      RESOURCE_TYPE_KEY,
      context.getHandler(),
    );

    if (!resourceType) {
      throw new Error('Resource type not specified.');
    }

    const resourceService = await this.getService(resourceType);
    let resource;
    if (resourceType === Resource.USER) {
      resource = await (resourceService as UsersService).findOneById(
        resourceId,
      );
    } else {
      resource = await (resourceService as any).findOne(resourceId);
    }

    if (!resource) {
      throw new ForbiddenException('Resource not found.');
    }

    const entityResource = this.toEntity(resource, resourceType);

    const canManage = ability.can(Action.Manage, entityResource);

    if (!canManage) {
      throw new ForbiddenException('No permission to manage the resource.');
    }

    return true;
  }
}
