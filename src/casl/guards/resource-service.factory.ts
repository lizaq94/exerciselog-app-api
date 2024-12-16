import { Injectable } from '@nestjs/common';
import { ExercisesService } from '../../exercises/exercises.service';
import { SetsService } from '../../sets/sets.service';
import { WorkoutsService } from '../../workouts/workouts.service';
import { Resource } from '../types/resource.type';

@Injectable()
export class ResourceServiceFactory {
  constructor(
    private workoutsService: WorkoutsService,
    private exercisesService: ExercisesService,
    private setsService: SetsService,
  ) {}

  getService(resourceType: Resource) {
    switch (resourceType) {
      case Resource.WORKOUT:
        return this.workoutsService;
      case Resource.EXERCISE:
        return this.exercisesService;
      case Resource.SET:
        return this.setsService;
      default:
        throw new Error('Invalid resource type');
    }
  }
}
