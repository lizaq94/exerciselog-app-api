import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiHeaders,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ResourceType } from '../casl/decorators/resource-type.decorator';
import { OwnershipGuard } from '../casl/guards/ownership.guard';
import { Resource } from '../casl/types/resource.type';
import { CreateSetDto } from '../sets/dto/create-set.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';
import { ExercisesService } from './exercises.service';
import { LoggerService } from '../logger/logger.service';
import { ExerciseResponseDto } from './dto/exercise-response.dto';
import { SetsResponseDto } from '../sets/dto/sets-response.dto';
import { SetResponseDto } from '../sets/dto/set-response.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { UploadsService } from '../uploads/providers/uploads.service';

@UseGuards(JwtAuthGuard)
@Controller('exercises')
@ApiTags('exercises')
export class ExercisesController {
  constructor(
    private exerciseService: ExercisesService,
    private uploadsService: UploadsService,
    private logger: LoggerService,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve an exercise by its unique identifier' })
  @ApiParam({
    name: 'id',
    description: 'A unique identifier for the exercise',
    example: '22f0dd54-7acd-476f-9fc9-140bb5cb8b20',
  })
  @ApiOkResponse({
    description: 'Returns the exercise matching the provided ID',
    type: ExerciseResponseDto,
  })
  findOne(@Param('id') id: string) {
    this.logger.log(
      `Fetching exercise with ID: ${id}`,
      ExercisesController.name,
    );
    return this.exerciseService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an existing exercise' })
  @UseGuards(OwnershipGuard)
  @ResourceType(Resource.EXERCISE)
  @ApiParam({
    name: 'id',
    description: 'The ID of the exercise to update',
    example: '22f0dd54-7acd-476f-9fc9-140bb5cb8b20',
  })
  @ApiBody({
    description: 'Fields to update for the exercise',
    type: UpdateExerciseDto,
  })
  @ApiOkResponse({
    description: 'Returns the updated exercise entity',
    type: ExerciseResponseDto,
  })
  update(
    @Param('id') id: string,
    @Body() updateExerciseDto: UpdateExerciseDto,
  ) {
    this.logger.log(
      `Updating exercise with ID: ${id}`,
      ExercisesController.name,
    );
    return this.exerciseService.update(id, updateExerciseDto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Delete an exercise by its ID' })
  @UseGuards(OwnershipGuard)
  @ResourceType(Resource.EXERCISE)
  @ApiParam({
    name: 'id',
    description: 'The ID of the exercise to delete',
    example: '22f0dd54-7acd-476f-9fc9-140bb5cb8b20',
  })
  @ApiNoContentResponse({
    description: 'Exercise deleted successfully. No content returned.',
  })
  delete(@Param('id') id: string) {
    this.logger.error(
      `Deleting exercise with ID: ${id}`,
      ExercisesController.name,
    );
    return this.exerciseService.delete(id);
  }

  @Get(':id/sets')
  @ApiOperation({ summary: 'Retrieve all sets for a specific exercise' })
  @ApiParam({
    name: 'id',
    description: 'The ID of the exercise to retrieve sets for',
    example: '22f0dd54-7acd-476f-9fc9-140bb5cb8b20',
  })
  @ApiOkResponse({
    description: 'Returns an array of sets associated with the exercise',
    type: SetsResponseDto,
    isArray: true,
  })
  findAllSets(@Param('id') id: string) {
    this.logger.log(
      `Retrieving sets for exercise ID: ${id}`,
      ExercisesController.name,
    );
    return this.exerciseService.findAllSets(id);
  }

  @Post(':id/sets')
  @ApiOperation({ summary: 'Add a new set to an exercise' })
  @UseGuards(OwnershipGuard)
  @ResourceType(Resource.EXERCISE)
  @ApiParam({
    name: 'id',
    description: 'The ID of the exercise to add a set to',
    example: '22f0dd54-7acd-476f-9fc9-140bb5cb8b20',
  })
  @ApiBody({
    description: 'Data required to create a new set',
    type: CreateSetDto,
  })
  @ApiCreatedResponse({
    description: 'Returns the created set entity',
    type: SetResponseDto,
  })
  addSet(@Param('id') id: string, @Body() createSetDto: CreateSetDto) {
    this.logger.log(
      `Adding new set to exercise ID: ${id}`,
      ExercisesController.name,
    );
    return this.exerciseService.addSet(id, createSetDto);
  }

  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(OwnershipGuard)
  @ResourceType(Resource.EXERCISE)
  @ApiOperation({ summary: 'Upload a new image for exercise' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        image: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @Post(':id/image')
  public uploadImage(
    @Param('id') id: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.uploadsService.uploadImage(file, id);
  }
}
