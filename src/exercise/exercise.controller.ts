import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import { ExerciseService } from './exercise.service';

@Controller('exercise')
export class ExerciseController {
  constructor(private exerciseService: ExerciseService) {}

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
