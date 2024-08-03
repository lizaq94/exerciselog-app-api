import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateExerciseDto } from '../exercises/dto/create-exercise.dto';
import { CreateWorkoutDto } from './dto/create-workout.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';

@Injectable()
export class WorkoutsService {
  constructor(private readonly databaseService: DatabaseService) {}

  public async findAll() {
    return this.databaseService.workout.findMany({
      include: { exercises: true },
    });
  }

  public async findOne(id: string) {
    const workout = await this.databaseService.workout.findUnique({
      where: { id },
      include: { exercises: true },
    });

    if (!workout) throw new NotFoundException('Workout not found');

    return workout;
  }

  public async create(createWorkoutDto: CreateWorkoutDto) {
    return this.databaseService.workout.create({
      data: createWorkoutDto,
    });
  }

  public async update(id: string, updateWorkoutDto: UpdateWorkoutDto) {
    return this.databaseService.workout.update({
      where: { id },
      data: updateWorkoutDto,
    });
  }

  public async delete(id: string) {
    const removeWorkout = this.findOne(id);

    if (!removeWorkout)
      throw new NotFoundException('Workout not found or has been deleted');

    await this.databaseService.workout.delete({ where: { id } });

    return removeWorkout;
  }

  public async findAllExercise(id: string) {
    const exercises = await this.databaseService.exercise.findMany({
      where: { workoutId: id },
    });

    if (!exercises.length) throw new NotFoundException('No exercises');

    return exercises;
  }

  public async addExercise(id: string, exerciseDto: CreateExerciseDto) {
    return this.databaseService.exercise.create({
      data: {
        ...exerciseDto,
        workout: {
          connect: { id },
        },
      },
    });
  }
}
