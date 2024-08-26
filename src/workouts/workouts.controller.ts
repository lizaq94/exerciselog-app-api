import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateExerciseDto } from '../exercises/dto/create-exercise.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { WorkoutsService } from './workouts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('workouts')
@ApiTags('workouts')
export class WorkoutsController {
  constructor(private readonly workoutService: WorkoutsService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workoutService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateWorkoutsDto: UpdateWorkoutDto,
  ) {
    return this.workoutService.update(id, updateWorkoutsDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.workoutService.delete(id);
  }

  @Get(':id/exercises')
  findAllExercise(@Param('id') id: string) {
    return this.workoutService.findAllExercise(id);
  }

  @Post(':id/exercises')
  addExercise(
    @Param('id') id: string,
    @Body(ValidationPipe) createExerciseDto: CreateExerciseDto,
  ) {
    return this.workoutService.addExercise(id, createExerciseDto);
  }
}
