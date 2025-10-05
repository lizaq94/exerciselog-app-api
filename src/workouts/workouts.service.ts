import { Injectable, NotFoundException } from '@nestjs/common';
import { paginator, PaginatorTypes } from '@nodeteam/nestjs-prisma-pagination';
import { Request } from 'express';
import { PaginationQueryDto } from '../common/pagination/dtos/pagination-query.dto';
import { PaginatedResult } from '../common/pagination/interfeces/paginated.intefece';
import { PaginationProvider } from '../common/pagination/pagination.provider';
import { DatabaseService } from '../database/database.service';
import { CreateExerciseDto } from '../exercises/dto/create-exercise.dto';
import { ExercisesService } from '../exercises/exercises.service';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { WorkoutEntity } from './entities/workout.entity';

const paginate: PaginatorTypes.PaginateFunction = paginator({
  page: 1,
  perPage: 10,
});

@Injectable()
export class WorkoutsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly exercisesService: ExercisesService,
    private readonly paginationProvider: PaginationProvider,
  ) {}

  public async findAll(
    userId: string,
    pagination: PaginationQueryDto,
    request: Request,
  ): Promise<PaginatedResult<WorkoutEntity>> {
    const result: PaginatorTypes.PaginatedResult<WorkoutEntity> =
      await paginate(
        this.databaseService.workout,
        {
          where: { userId },
          include: { exercises: true },
        },
        {
          page: pagination.page,
          perPage: pagination.limit,
        },
      );

    return {
      ...result,
      links: this.paginationProvider.generatePaginationLinks(
        request,
        result.meta.lastPage,
        pagination.page,
        pagination.limit,
      ),
    };
  }

  public async findOne(id: string): Promise<WorkoutEntity> {
    const workout = await this.databaseService.workout.findUnique({
      where: { id },
      include: { exercises: true },
    });

    if (!workout) throw new NotFoundException('Workout not found');

    return workout;
  }

  public async create(
    userId: string,
    createWorkoutDto: CreateWorkoutDto,
  ): Promise<WorkoutEntity> {
    return this.databaseService.workout.create({
      data: {
        ...createWorkoutDto,
        user: {
          connect: { id: userId },
        },
      },
    });
  }

  public async update(
    id: string,
    updateWorkoutDto: UpdateWorkoutDto,
  ): Promise<WorkoutEntity> {
    await this.findOne(id);

    return this.databaseService.workout.update({
      where: { id },
      data: updateWorkoutDto,
    });
  }

  public async delete(id: string): Promise<void> {
    await this.findOne(id);

    await this.databaseService.workout.delete({ where: { id } });
  }

  public async findAllExercise(id: string) {
    await this.findOne(id);
    return this.exercisesService.findAll(id);
  }

  public async addExercise(id: string, exerciseDto: CreateExerciseDto) {
    await this.findOne(id);
    return this.exercisesService.create(id, exerciseDto);
  }
}
