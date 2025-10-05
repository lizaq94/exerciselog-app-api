import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PaginationQueryDto } from '../common/pagination/dtos/pagination-query.dto';
import { DatabaseService } from '../database/database.service';
import { CreateWorkoutDto } from '../workouts/dto/create-workout.dto';
import { WorkoutsService } from '../workouts/workouts.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { Request } from 'express';
import { HashingProvider } from '../auth/providers/hashing.provider';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UsersService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly workoutService: WorkoutsService,
    private readonly hashingProvider: HashingProvider,
  ) {}

  async findOne(
    email: string,
    throwError: boolean = true,
  ): Promise<UserEntity> {
    const user = await this.databaseService.user.findUnique({
      where: { email },
      include: { workouts: true },
    });

    if (!user && throwError) throw new NotFoundException('User not found');

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

    return { ...user } as UserEntity;
  }

  async create(createUserDto: CreateUserDto): Promise<UserEntity> {
    const password = await this.hashingProvider.encrypt(createUserDto.password);

    try {
      const user = await this.databaseService.user.create({
        data: {
          ...createUserDto,
          password,
        },
      });

      return plainToInstance(UserEntity, user);
    } catch (error) {
      if (error.code === 'P2002') {
        const field = error.meta?.target?.[0] || 'field';
        throw new BadRequestException(`${field} is already taken`);
      }
      throw error;
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<UserEntity> {
    await this.checkUserExists(id);

    let data = updateUserDto;

    if (updateUserDto.password) {
      const password = await this.hashingProvider.encrypt(
        updateUserDto.password,
      );

      data = {
        ...updateUserDto,
        password,
      };
    }

    const updatedUser = await this.databaseService.user.update({
      where: { id },
      data,
    });

    return plainToInstance(UserEntity, updatedUser);
  }

  async delete(id: string): Promise<void> {
    await this.checkUserExists(id, 'User not found or has been deleted');

    await this.databaseService.user.delete({ where: { id } });
  }

  async findAllWorkouts(
    id: string,
    pagination: PaginationQueryDto,
    request: Request,
  ) {
    await this.checkUserExists(id);
    return this.workoutService.findAll(id, pagination, request);
  }

  async addWorkout(id: string, createWorkoutDto: CreateWorkoutDto) {
    await this.checkUserExists(id);
    return this.workoutService.create(id, createWorkoutDto);
  }

  private async checkUserExists(
    id: string,
    errorMessage?: string,
  ): Promise<void> {
    const userExists = await this.databaseService.user.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!userExists)
      throw new NotFoundException(errorMessage || 'User not found');
  }
}
