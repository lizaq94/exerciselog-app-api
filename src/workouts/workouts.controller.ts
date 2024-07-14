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

@Controller('workouts')
export class WorkoutsController {
  @Get()
  findAll() {
    return 'all workouts';
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return `workout of id: ${id}`;
  }

  @Post()
  create(@Body() createWorkoutsDto: any) {
    return `create workout`;
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateWorkoutsDto: any) {
    return `update workout od id: ${id}`;
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return `delete workout od id: ${id}`;
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
