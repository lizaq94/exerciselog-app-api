import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { encrypt } from '../utils/bcrypt';
import { CreateWorkoutDto } from '../workouts/dto/create-workout.dto';
import { WorkoutsService } from '../workouts/workouts.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly workoutService: WorkoutsService,
  ) {}

  async findOne(email: string): Promise<UserEntity> {
    const user = await this.databaseService.user.findUnique({
      where: { email },
      include: { workouts: true },
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async findOneById(id: string): Promise<UserEntity> {
    const user = await this.databaseService.user.findUnique({
      where: { id },
      include: {
        workouts: { include: { exercises: { include: { sets: true } } } },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    return user;
  }

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    const password = await encrypt(createUserDto.password);

    return this.databaseService.user.create({
      data: {
        ...createUserDto,
        password,
      },
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    const userToUpdate = await this.databaseService.user.findUnique({
      where: { id },
    });

    if (!userToUpdate) throw new NotFoundException('User not found');

    let data = updateUserDto;

    if (updateUserDto.password) {
      const password = await encrypt(updateUserDto.password);

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
    await this.findOneById(id);
    return this.workoutService.findAll(id);
  }

  async addWorkout(id: string, createWorkoutDto: CreateWorkoutDto) {
    await this.findOneById(id);
    return this.workoutService.create(id, createWorkoutDto);
  }
}
