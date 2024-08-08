import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateSetDto } from '../sets/dto/create-set.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { CreateExerciseDto } from './dto/create-exercise.dto';

@Injectable()
export class ExercisesService {
  constructor(private readonly databaseService: DatabaseService) {}

  public async findAll(workoutId: string) {
    return this.databaseService.exercise.findMany({
      where: { workoutId },
    });
  }

  public async create(workoutId: string, exerciseDto: CreateExerciseDto) {
    return this.databaseService.exercise.create({
      data: {
        ...exerciseDto,
        workout: {
          connect: { id: workoutId },
        },
      },
    });
  }

  async findOne(id: string) {
    const exercise = await this.databaseService.exercise.findUnique({
      where: { id },
      include: { sets: true },
    });

    if (!exercise) throw new NotFoundException('Exercise not found');

    return exercise;
  }

  async update(id: string, updateExerciseDto: UpdateExerciseDto) {
    const isExerciseExist = await this.databaseService.exercise.findUnique({
      where: { id },
    });

    if (!isExerciseExist) throw new NotFoundException('Exercise not found');

    return this.databaseService.exercise.update({
      where: { id },
      data: updateExerciseDto,
    });
  }

  async delete(id: string) {
    const isExerciseExist = this.findOne(id);

    if (!isExerciseExist)
      throw new NotFoundException('Exercise not found or has been deleted');

    return this.databaseService.exercise.delete({ where: { id } });
  }

  async findAllSets(exerciseId: string) {
    const sets = await this.databaseService.set.findMany({
      where: { exerciseId },
    });

    if (!sets.length) throw new NotFoundException('No sets');

    return sets;
  }

  public async addSet(exerciseId: string, createSetDto: CreateSetDto) {
    return this.databaseService.set.create({
      data: {
        ...createSetDto,
        exercise: {
          connect: { id: exerciseId },
        },
      },
    });
  }
}
