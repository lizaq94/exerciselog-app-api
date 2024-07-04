import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { ExercisesService } from './exercises.service';

@Controller('exercises')
export class ExercisesController {
  constructor(private exerciseService: ExercisesService) {}

  @Get()
  findAll() {
    return this.exerciseService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.exerciseService.findOne(id);
  }

  @Post()
  create(@Body() creatExerciseDto: any) {
    return this.exerciseService.create(creatExerciseDto);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body() updateExerciseDto: any) {
    return this.exerciseService.update(id, updateExerciseDto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.exerciseService.delete(id);
  }
}
