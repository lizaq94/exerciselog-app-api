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
import { CreateSetDto } from '../sets/dto/create-set.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExercisesService } from './exercises.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ExerciseEntity } from './entities/exercise.entity';
import { SetEntity } from '../sets/entities/set.entity';
import { PoliciesGuard } from '../casl/guards/policies.guard';
import { CheckPolicies } from '../casl/decorators/check-policies.decorator';
import { Action, AppAbility } from '../casl/casl-ability.factory';

@UseGuards(JwtAuthGuard)
@Controller('exercises')
@ApiTags('exercises')
export class ExercisesController {
  constructor(private exerciseService: ExercisesService) {}

  @Get(':id')
  @ApiOkResponse({ type: ExerciseEntity })
  @UseGuards(PoliciesGuard)
  @CheckPolicies((ability: AppAbility, exercise: ExerciseEntity) =>
    ability.can(Action.Manage, exercise),
  )
  findOne(@Param('id') id: string) {
    return this.exerciseService.findOne(id);
  }

  @Patch(':id')
  @ApiBody({ type: UpdateExerciseDto })
  @ApiOkResponse({ type: ExerciseEntity })
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateExerciseDto: UpdateExerciseDto,
  ) {
    return this.exerciseService.update(id, updateExerciseDto);
  }

  @Delete(':id')
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
  @ApiBody({ type: CreateSetDto })
  @ApiCreatedResponse({ type: SetEntity })
  addSet(@Param('id') id: string, @Body() createSetDto: CreateSetDto) {
    return this.exerciseService.addSet(id, createSetDto);
  }
}
