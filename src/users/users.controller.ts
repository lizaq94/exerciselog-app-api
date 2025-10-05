import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CurrentUser } from '../auth/current-user.decorator';
import { UserEntity } from './entities/user.entity';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LoggerService } from '../logger/logger.service';
import { CreateWorkoutDto } from '../workouts/dto/create-workout.dto';
import { GetWorkoutsDto } from '../workouts/dto/get-workouts.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';
import { Request as Req } from 'express';
import { UserResponseDto } from './dto/user-response.dto';
import { WorkoutResponseDto } from '../workouts/dto/workout-response.dto';
import { WorkoutsResponseDto } from '../workouts/dto/workouts-response.dto';
import { OwnershipGuard } from '../casl/guards/ownership.guard';
import { Resource } from '../casl/types/resource.type';
import { ResourceType } from '../casl/decorators/resource-type.decorator';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(
    private readonly userService: UsersService,
    private logger: LoggerService,
  ) {}

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiOkResponse({
    type: UserResponseDto,
    description: 'Returns the current authenticated user information',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  getMe(@CurrentUser() user: UserEntity) {
    this.logger.log(
      `Fetching current user info: ${user.id}`,
      UsersController.name,
    );
    return {
      id: user.id,
      username: user.username,
      email: user.email,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({
    type: CreateUserDto,
    description: 'The data to create a new user',
    examples: {
      example1: {
        value: {
          username: 'johndoe',
          email: 'johndoe@example.com',
          password: 'securepassword123',
        },
      },
    },
  })
  @ApiCreatedResponse({
    type: UserResponseDto,
    description: 'Creates a new user and returns the created user entity',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  create(@Body() createUserDto: CreateUserDto) {
    this.logger.log(`Adding new user`, UsersController.name);
    return this.userService.create(createUserDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @ResourceType(Resource.USER)
  @ApiOperation({ summary: 'Update an existing user' })
  @ApiParam({
    name: 'id',
    description: 'The unique identifier of the user to be updated',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: UpdateUserDto,
    description: 'The data to update the user information',
    examples: {
      example1: {
        value: {
          email: 'newemail@example.com',
        },
      },
    },
  })
  @ApiOkResponse({
    type: UserResponseDto,
    description: 'Updates a user and returns the updated user entity',
  })
  @UseInterceptors(ClassSerializerInterceptor)
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    this.logger.log(`Updating user with ID: ${id}`, UsersController.name);
    return this.userService.update(id, updateUserDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @ResourceType(Resource.USER)
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an user by its ID' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the user to delete',
    example: '22f0dd54-7acd-476f-9fc9-140bb5cb8b20',
  })
  @ApiNoContentResponse({
    description: 'User deleted successfully. No content returned.',
  })
  delete(@Param('id') id: string) {
    this.logger.error(`Deleting user with ID: ${id}`, UsersController.name);
    return this.userService.delete(id);
  }

  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @ResourceType(Resource.USER)
  @ApiOperation({ summary: 'Get all workouts for a user' })
  @ApiParam({
    name: 'id',
    description:
      'The unique identifier of the user whose workouts are retrieved',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    type: WorkoutsResponseDto,
    description: 'Returns a list of workouts associated with the user',
  })
  @Get(':id/workouts')
  findAllWorkouts(
    @Param('id') id: string,
    @Query() workoutsQuery: GetWorkoutsDto,
    @Request() request: Req,
  ) {
    this.logger.log(
      `Retrieving workouts for user ID: ${id}`,
      UsersController.name,
    );
    return this.userService.findAllWorkouts(id, workoutsQuery, request);
  }

  @UseGuards(JwtAuthGuard, OwnershipGuard)
  @ResourceType(Resource.USER)
  @Post(':id/workouts')
  @ApiOperation({ summary: 'Add a workout to a user' })
  @ApiParam({
    name: 'id',
    description:
      'The unique identifier of the user to whom the workout will be added',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiBody({
    type: CreateWorkoutDto,
    description: 'The workout data to add to a user',
    examples: {
      example1: {
        value: {
          name: 'Morning Strength Training',
          date: '2023-10-21T10:00:00.000Z',
          duration: 60,
          notes: 'Focus on lower body exercises',
        },
      },
    },
  })
  @ApiCreatedResponse({
    type: WorkoutResponseDto,
    description:
      'Adds a workout to a user and returns the created workout entity',
  })
  addWorkout(
    @Param('id') id: string,
    @Body() createWorkoutDto: CreateWorkoutDto,
  ) {
    this.logger.log(
      `Adding new workout for user ID: ${id}`,
      UsersController.name,
    );
    return this.userService.addWorkout(id, createWorkoutDto);
  }
}
