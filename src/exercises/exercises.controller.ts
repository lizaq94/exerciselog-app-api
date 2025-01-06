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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResourceType } from '../casl/decorators/resource-type.decorator';
import { OwnershipGuard } from '../casl/guards/ownership.guard';
import { Resource } from '../casl/types/resource.type';
import { CreateSetDto } from '../sets/dto/create-set.dto';
import { SetEntity } from '../sets/entities/set.entity';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExerciseEntity } from './entities/exercise.entity';
import { ExercisesService } from './exercises.service';

@UseGuards(JwtAuthGuard)
@Controller('exercises')
@ApiTags('exercises')
export class ExercisesController {
  constructor(private exerciseService: ExercisesService) {}

  @Get(':id')
  @ApiOkResponse({ type: ExerciseEntity })
  findOne(@Param('id') id: string) {
    return this.exerciseService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(OwnershipGuard)
  @ResourceType(Resource.EXERCISE)
  @ApiBody({ type: UpdateExerciseDto })
  @ApiOkResponse({ type: ExerciseEntity })
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateExerciseDto: UpdateExerciseDto,
  ) {
    return this.exerciseService.update(id, updateExerciseDto);
  }

  @Delete(':id')
  @UseGuards(OwnershipGuard)
  @ResourceType(Resource.EXERCISE)
  @ApiOkResponse({ type: ExerciseEntity })
  delete(@Param('id') id: string) {
    return this.exerciseService.delete(id);
  }

  @Get(':id/sets')
  @ApiOkResponse({ type: SetEntity, isArray: true })
  findAllSets(@Param('id') id: string) {
    return this.exerciseService.findAllSets(id);
  }

  @Post(':id/sets')
  @UseGuards(OwnershipGuard)
  @ResourceType(Resource.EXERCISE)
  @ApiBody({ type: CreateSetDto })
  @ApiCreatedResponse({ type: SetEntity })
  addSet(@Param('id') id: string, @Body() createSetDto: CreateSetDto) {
    return this.exerciseService.addSet(id, createSetDto);
  }
}
