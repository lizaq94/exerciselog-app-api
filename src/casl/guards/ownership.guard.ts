import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Action, CaslAbilityFactory } from '../casl-ability.factory';
import { RESOURCE_TYPE_KEY } from '../decorators/resource-type.decorator';
import { Resource } from '../types/resource.type';
import { WorkoutEntity } from '../../workouts/entities/workout.entity';
import { ExerciseEntity } from '../../exercises/entities/exercise.entity';
import { SetEntity } from '../../sets/entities/set.entity';
import { UserEntity } from '../../users/entities/user.entity';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class OwnershipGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private caslAbilityFactory: CaslAbilityFactory,
    private databaseService: DatabaseService,
  ) {}

  private entityMap = {
    [Resource.WORKOUT]: WorkoutEntity,
    [Resource.EXERCISE]: ExerciseEntity,
    [Resource.SET]: SetEntity,
    [Resource.USER]: UserEntity,
  };

  private findResource(resourceType: string, id: string) {
    return this.databaseService[resourceType.toLowerCase()].findUnique({
      where: { id },
    });
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

    const resource = await this.findResource(resourceType, resourceId);

    if (!resource) {
      throw new NotFoundException('Resource not found.');
    }

    const entityResource = this.toEntity(resource, resourceType);

    const canManage = ability.can(Action.Manage, entityResource);

    if (!canManage) {
      throw new ForbiddenException('No permission to manage the resource.');
    }

    return true;
  }
}
