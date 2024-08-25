import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags } from '@nestjs/swagger';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateWorkoutDto } from '../workouts/dto/create-workout.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userService.findOne(id);
  }

  @Post()
  create(@Body(ValidationPipe) creatUserDto: CreateUserDto) {
    return this.userService.create(creatUserDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateUserDto: UpdateUserDto,
  ) {
    return this.userService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/workouts')
  findAllWorkouts(@Param('id') id: string) {
    return this.userService.findAllWorkouts(id);
  }

  @Post(':id/workouts')
  addWorkout(
    @Param('id') id: string,
    @Body(ValidationPipe) createWorkoutDto: CreateWorkoutDto,
  ) {
    return this.userService.addWorkout(id, createWorkoutDto);
  }
}
