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
import { CreateSetDto } from '../sets/dto/create-set.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExercisesService } from './exercises.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('exercises')
@ApiTags('exercises')
export class ExercisesController {
  constructor(private exerciseService: ExercisesService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.exerciseService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateExerciseDto: UpdateExerciseDto,
  ) {
    return this.exerciseService.update(id, updateExerciseDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.exerciseService.delete(id);
  }

  @Get(':id/sets')
  findAllSets(@Param('id') id: string) {
    return this.exerciseService.findAllSets(id);
  }

  @Post(':id/sets')
  addSet(@Param('id') id: string, @Body() createSetDto: CreateSetDto) {
    return this.exerciseService.addSet(id, createSetDto);
  }
}
