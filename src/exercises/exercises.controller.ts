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
import { ApiTags } from '@nestjs/swagger';
import { CreateSetDto } from '../sets/dto/create-set.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExercisesService } from './exercises.service';

@Controller('exercises')
@ApiTags('exercises')
export class ExercisesController {
  constructor(private exerciseService: ExercisesService) {}

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.exerciseService.findOne(id);
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

  @Get(':id/sets')
  findAllSets(@Param('id') id: number) {
    return ['sets', id];
  }

  @Post(':id/sets')
  addSet(@Param('id') id: number, @Body() createSetsDto: CreateSetDto) {
    return `create set to exercise ${id}`;
  }
}
