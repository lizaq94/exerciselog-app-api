import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateSetDto } from '../sets/dto/create-set.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { SetsService } from '../sets/sets.service';
import { ExerciseEntity } from './entities/exercise.entity';

@Injectable()
export class ExercisesService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly setsService: SetsService,
  ) {}

  public async findAll(workoutId: string): Promise<ExerciseEntity[]> {
    return this.databaseService.exercise.findMany({
      where: { workoutId },
    });
  }

  public async create(
    workoutId: string,
    exerciseDto: CreateExerciseDto,
  ): Promise<ExerciseEntity> {
    return this.databaseService.exercise.create({
      data: {
        ...exerciseDto,
        workout: {
          connect: { id: workoutId },
        },
      },
    });
  }

  async findOne(id: string): Promise<ExerciseEntity> {
    const exercise = await this.databaseService.exercise.findUnique({
      where: { id },
      include: { sets: true },
    });

    if (!exercise) throw new NotFoundException('Exercise not found');

    return exercise;
  }

  async update(
    id: string,
    updateExerciseDto: UpdateExerciseDto,
  ): Promise<ExerciseEntity> {
    const isExerciseExist = await this.databaseService.exercise.findUnique({
      where: { id },
    });

    if (!isExerciseExist) throw new NotFoundException('Exercise not found');

    return this.databaseService.exercise.update({
      where: { id },
      data: updateExerciseDto,
    });
  }

  async delete(id: string): Promise<void> {
    const isExerciseExist = this.findOne(id);

    if (!isExerciseExist)
      throw new NotFoundException('Exercise not found or has been deleted');

    this.databaseService.exercise.delete({ where: { id } });
  }

  async findAllSets(id: string) {
    await this.findOne(id);
    return this.setsService.findAll(id);
  }

  public async addSet(id: string, createSetDto: CreateSetDto) {
    await this.findOne(id);
    return this.setsService.create(id, createSetDto);
  }
}
