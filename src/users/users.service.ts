import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { DatabaseService } from '../database/database.service';
import { encryptPassword } from '../utils/bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';
import { WorkoutsService } from '../workouts/workouts.service';
import { CreateWorkoutDto } from '../workouts/dto/create-workout.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly workoutService: WorkoutsService,
  ) {}

  async findOne(id: string) {
    const user = await this.databaseService.user.findUnique({ where: { id } });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async create(createUserDto: CreateUserDto) {
    const password = await encryptPassword(createUserDto.password);

    return this.databaseService.user.create({
      data: {
        ...createUserDto,
        password,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const userToUpdate = await this.databaseService.user.findUnique({
      where: { id },
    });

    if (!userToUpdate) throw new NotFoundException('User not found');

    let data = updateUserDto;

    if (updateUserDto.password) {
      const password = await encryptPassword(updateUserDto.password);

      data = {
        ...updateUserDto,
        password,
      };
    }

    return this.databaseService.user.update({
      where: { id },
      data,
    });
  }

  async findAllWorkouts(id: string) {
    return this.workoutService.findAll(id);
  }

  async addWorkout(id: string, createWorkoutDto: CreateWorkoutDto) {
    return this.workoutService.create(id, createWorkoutDto);
  }
}
