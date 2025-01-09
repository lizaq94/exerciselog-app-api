import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateWorkoutDto } from '../workouts/dto/create-workout.dto';
import { WorkoutEntity } from '../workouts/entities/workout.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: UserEntity })
  findOne(@Param('id') id: string) {
    return this.userService.findOneById(id);
  }

  @Post()
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({ type: UserEntity })
  create(@Body() creatUserDto: CreateUserDto) {
    return this.userService.create(creatUserDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBody({ type: UpdateUserDto })
  @ApiOkResponse({ type: UserEntity })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.userService.update(id, updateUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: WorkoutEntity, isArray: true })
  @Get(':id/workouts')
  findAllWorkouts(@Param('id') id: string) {
    return this.userService.findAllWorkouts(id);
  }

  @Post(':id/workouts')
  @ApiCreatedResponse({ type: WorkoutEntity })
  addWorkout(
    @Param('id') id: string,
    @Body() createWorkoutDto: CreateWorkoutDto,
  ) {
    return this.userService.addWorkout(id, createWorkoutDto);
  }
}
