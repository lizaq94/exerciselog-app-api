import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateExerciseDto } from '../exercises/dto/create-exercise.dto';
import { WorkoutsService } from './workouts.service';
import { Prisma } from '@prisma/client';

@Controller('workouts')
export class WorkoutsController {
  constructor(private readonly workoutService: WorkoutsService) {}

  @Get()
  findAll() {
    return this.workoutService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.workoutService.findOne(id);
  }

  @Post()
  create(@Body() createWorkoutsDto: Prisma.WorkoutCreateInput) {
    return this.workoutService.create(createWorkoutsDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateWorkoutsDto: Prisma.WorkoutUpdateInput,
  ) {
    return this.workoutService.update(id, updateWorkoutsDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.workoutService.delete(id);
  }

  @Get(':id/exercises')
  findAllExercise(@Param('id') id: number) {
    return `findAll exercise for workout ${id}`;
  }

  @Post(':id/exercises')
  addExercise(
    @Param('id') id: number,
    @Body() createExerciseDto: CreateExerciseDto,
  ) {}
}
