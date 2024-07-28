import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class WorkoutsService {
  constructor(private readonly databaseService: DatabaseService) {}

  public async findAll() {
    return this.databaseService.workout.findMany();
  }

  public async findOne(id: string) {
    const workout = await this.databaseService.workout.findUnique({
      where: { id },
    });

    if (!workout) throw new NotFoundException('Workout not found');

    return workout;
  }

  public async create(createWorkoutDto: Prisma.WorkoutCreateInput) {
    return this.databaseService.workout.create({
      data: createWorkoutDto,
    });
  }

  public async update(id: string, updateWorkoutDto: Prisma.WorkoutUpdateInput) {
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
}
