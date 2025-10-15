import { Injectable } from '@nestjs/common';
import { LoggerService } from '../../../logger/logger.service';
import { AiResponseDto } from '../../dto/ai-response';
import { AiTrainingPlanDto } from '../../dto/ai-response';
import { AiExerciseDto } from '../../dto/ai-response';
import { AiSetDto } from '../../dto/ai-response';
import { CreateWorkoutBulkDto } from '../../../workouts/dto/bulk';
import { CreateExerciseBulkDto } from '../../../workouts/dto/bulk';
import { CreateSetBulkDto } from '../../../workouts/dto/bulk';

@Injectable()
export class AiResponseTransformerService {
  constructor(private readonly logger: LoggerService) {}

  public transformToAppFormat(
    aiResponse: AiResponseDto,
  ): CreateWorkoutBulkDto[] {
    this.logger.log(
      `Transforming ${aiResponse.trainingPlans.length} training plans to app format`,
      AiResponseTransformerService.name,
    );

    const workouts = aiResponse.trainingPlans.map((plan) =>
      this.transformPlan(plan),
    );

    this.logger.log(
      `Successfully transformed ${workouts.length} workout plans`,
      AiResponseTransformerService.name,
    );

    return workouts;
  }

  private transformPlan(plan: AiTrainingPlanDto): CreateWorkoutBulkDto {
    return {
      name: plan.name,
      notes: plan.notes,
      duration: plan.duration,
      exercises: plan.exercises.map((exercise) =>
        this.transformExercise(exercise),
      ),
    };
  }

  private transformExercise(exercise: AiExerciseDto): CreateExerciseBulkDto {
    return {
      order: exercise.order,
      name: exercise.name,
      type: exercise.type,
      notes: exercise.notes,
      sets: exercise.sets.map((set) => this.transformSet(set)),
    };
  }

  private transformSet(set: AiSetDto): CreateSetBulkDto {
    return {
      order: set.order,
      repetitions: set.repetitions,
      weight: set.weight,
      durationInSeconds: set.durationInSeconds,
      restAfterSetInSeconds: set.restAfterSetInSeconds,
    };
  }
}
