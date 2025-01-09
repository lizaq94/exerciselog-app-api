import {
  Body,
  Controller,
  Delete,
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
import { ResourceType } from '../casl/decorators/resource-type.decorator';
import { OwnershipGuard } from '../casl/guards/ownership.guard';
import { Resource } from '../casl/types/resource.type';
import { CreateExerciseDto } from '../exercises/dto/create-exercise.dto';
import { ExerciseEntity } from '../exercises/entities/exercise.entity';
import { UpdateWorkoutDto } from './dto/update-workout.dto';
import { WorkoutEntity } from './entities/workout.entity';
import { WorkoutsService } from './workouts.service';

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
  @UseGuards(OwnershipGuard)
  @ResourceType(Resource.WORKOUT)
  @ApiBody({ type: UpdateWorkoutDto })
  @ApiOkResponse({ type: WorkoutEntity })
  update(@Param('id') id: string, @Body() updateWorkoutsDto: UpdateWorkoutDto) {
    return this.workoutService.update(id, updateWorkoutsDto);
  }

  @Delete(':id')
  @UseGuards(OwnershipGuard)
  @ResourceType(Resource.WORKOUT)
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
  @UseGuards(OwnershipGuard)
  @ResourceType(Resource.WORKOUT)
  @ApiBody({ type: CreateExerciseDto })
  @ApiCreatedResponse({ type: ExerciseEntity })
  addExercise(
    @Param('id') id: string,
    @Body() createExerciseDto: CreateExerciseDto,
  ) {
    return this.workoutService.addExercise(id, createExerciseDto);
  }
}
