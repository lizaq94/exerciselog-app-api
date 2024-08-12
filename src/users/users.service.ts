import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { encryptPassword } from '../utils/bcrypt';
import { CreateWorkoutDto } from '../workouts/dto/create-workout.dto';
import { WorkoutsService } from '../workouts/workouts.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly workoutService: WorkoutsService,
  ) {}

  async findOne(username: string): Promise<UserDto> {
    const user = await this.databaseService.user.findUnique({
      where: { username },
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<UserDto> {
    const password = await encryptPassword(createUserDto.password);

    return this.databaseService.user.create({
      data: {
        ...createUserDto,
        password,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserDto> {
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
    await this.findOne(id);
    return this.workoutService.findAll(id);
  }

  async addWorkout(id: string, createWorkoutDto: CreateWorkoutDto) {
    await this.findOne(id);
    return this.workoutService.create(id, createWorkoutDto);
  }
}
