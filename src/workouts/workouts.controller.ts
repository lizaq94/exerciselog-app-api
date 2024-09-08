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
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { CreateExerciseDto } from '../exercises/dto/create-exercise.dto';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { WorkoutsService } from './workouts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { WorkoutEntity } from './entities/workout.entity';
import { ExerciseEntity } from '../exercises/entities/exercise.entity';

@UseGuards(JwtAuthGuard)
@Controller('workouts')
@ApiTags('workouts')
export class WorkoutsController {
  constructor(private readonly workoutService: WorkoutsService) {}

  @Get(':id')
  @ApiOkResponse({ type: WorkoutEntity })
  findOne(@Param('id') id: string) {
    return this.workoutService.findOne(id);
  }

  @Patch(':id')
  @ApiBody({ type: UpdateWorkoutDto })
  @ApiOkResponse({ type: WorkoutEntity })
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateWorkoutsDto: UpdateWorkoutDto,
  ) {
    return this.workoutService.update(id, updateWorkoutsDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: WorkoutEntity })
  delete(@Param('id') id: string) {
    return this.workoutService.delete(id);
  }

  @Get(':id/exercises')
  @ApiOkResponse({ type: ExerciseEntity, isArray: true })
  findAllExercise(@Param('id') id: string) {
    return this.workoutService.findAllExercise(id);
  }

  @Post(':id/exercises')
  @ApiBody({ type: CreateExerciseDto })
  @ApiCreatedResponse({ type: ExerciseEntity })
  addExercise(
    @Param('id') id: string,
    @Body(ValidationPipe) createExerciseDto: CreateExerciseDto,
  ) {
    return this.workoutService.addExercise(id, createExerciseDto);
  }
}
