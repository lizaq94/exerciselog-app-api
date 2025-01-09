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
  ApiOperation,
  ApiParam,
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
  @ApiOperation({ summary: 'Get workout by its unique ID' })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier for the workout',
    example: '22f0dd54-7acd-476f-9fc9-140bb5cb8b20',
  })
  @ApiOkResponse({
    description: 'Returns the workout matching the provided ID',
    type: WorkoutEntity,
  })
  findOne(@Param('id') id: string) {
    return this.workoutService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a workout by its ID' })
  @UseGuards(OwnershipGuard)
  @ResourceType(Resource.WORKOUT)
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the workout to update',
    example: '22f0dd54-7acd-476f-9fc9-140bb5cb8b20',
  })
  @ApiBody({
    description: 'Fields to update for the workout',
    type: UpdateWorkoutDto,
  })
  @ApiOkResponse({
    description: 'Returns the updated workout entity',
    type: WorkoutEntity,
  })
  update(@Param('id') id: string, @Body() updateWorkoutsDto: UpdateWorkoutDto) {
    return this.workoutService.update(id, updateWorkoutsDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a workout by its unique ID' })
  @UseGuards(OwnershipGuard)
  @ResourceType(Resource.WORKOUT)
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the workout to delete',
    example: '22f0dd54-7acd-476f-9fc9-140bb5cb8b20',
  })
  @ApiOkResponse({
    description: 'Returns the deleted workout entity',
    type: WorkoutEntity,
  })
  delete(@Param('id') id: string) {
    return this.workoutService.delete(id);
  }

  @Get(':id/exercises')
  @ApiOperation({ summary: 'Get all exercises for a specific workout' })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the workout',
    example: '22f0dd54-7acd-476f-9fc9-140bb5cb8b20',
  })
  @ApiOkResponse({
    description: 'Returns a list of exercises associated with the workout',
    type: ExerciseEntity,
    isArray: true,
  })
  findAllExercise(@Param('id') id: string) {
    return this.workoutService.findAllExercise(id);
  }

  @Post(':id/exercises')
  @ApiOperation({ summary: 'Add a new exercise to a workout' })
  @UseGuards(OwnershipGuard)
  @ResourceType(Resource.WORKOUT)
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the workout to add exercises to',
    example: '22f0dd54-7acd-476f-9fc9-140bb5cb8b20',
  })
  @ApiBody({
    description: 'Details of the exercise to add to the workout',
    type: CreateExerciseDto,
  })
  @ApiCreatedResponse({
    description: 'Returns the created exercise entity added to the workout',
    type: ExerciseEntity,
  })
  addExercise(
    @Param('id') id: string,
    @Body() createExerciseDto: CreateExerciseDto,
  ) {
    return this.workoutService.addExercise(id, createExerciseDto);
  }
}
