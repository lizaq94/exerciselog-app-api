import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  ValidationPipe,
} from '@nestjs/common';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExercisesService } from './exercises.service';

@Controller('exercises')
export class ExercisesController {
  constructor(private exerciseService: ExercisesService) {}

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.exerciseService.findOne(id);
  }

  @Post()
  create(@Body(ValidationPipe) creatExerciseDto: CreateExerciseDto) {
    return this.exerciseService.create(creatExerciseDto);
  }

  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body(ValidationPipe) updateExerciseDto: UpdateExerciseDto,
  ) {
    return this.exerciseService.update(id, updateExerciseDto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.exerciseService.delete(id);
  }
}
