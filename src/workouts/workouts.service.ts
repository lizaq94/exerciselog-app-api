import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateExerciseDto } from '../exercises/dto/create-exercise.dto';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { ExercisesService } from '../exercises/exercises.service';
import { WorkoutEntity } from './entities/workout.entity';

@Injectable()
export class WorkoutsService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly exercisesService: ExercisesService,
  ) {}

  public async findAll(userId: string): Promise<WorkoutEntity[]> {
    return this.databaseService.workout.findMany({
      where: { userId },
      include: { exercises: true },
    });
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
    return this.databaseService.workout.update({
      where: { id },
      data: updateWorkoutDto,
    });
  }

  public async delete(id: string): Promise<void> {
    const removeWorkout = await this.findOne(id);

    if (!removeWorkout)
      throw new NotFoundException('Workout not found or has been deleted');

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
