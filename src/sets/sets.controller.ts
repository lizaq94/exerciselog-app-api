import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBody,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger';
import { ResourceType } from '../casl/decorators/resource-type.decorator';
import { OwnershipGuard } from '../casl/guards/ownership.guard';
import { Resource } from '../casl/types/resource.type';
import { LoggerService } from '../logger/logger.service';
import { UpdateSetDto } from './dto/update-set.dto';
import { SetsService } from './sets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SetEntity } from './entities/set.entity';

@UseGuards(JwtAuthGuard)
@Controller('sets')
@ApiTags('sets')
export class SetsController {
  constructor(
    private setsService: SetsService,
    private logger: LoggerService,
  ) {}

  @Get(':id')
  @ApiOperation({ summary: 'Retrieve a specific set by its unique identifier' })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier for the set',
    example: '22f0dd54-7acd-476f-9fc9-140bb5cb8b20',
  })
  @ApiOkResponse({
    description: 'Returns the set matching the provided ID',
    type: SetEntity,
  })
  findOne(@Param('id') id: string) {
    this.logger.log(`Fetching set with ID: ${id}`, SetsController.name);
    return this.setsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Modify an existing set by its ID' })
  @UseGuards(OwnershipGuard)
  @ResourceType(Resource.SET)
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the set to update',
    example: '22f0dd54-7acd-476f-9fc9-140bb5cb8b20',
  })
  @ApiBody({
    description: 'Fields to update for the set',
    type: UpdateSetDto,
  })
  @ApiOkResponse({
    description: 'Returns the updated set entity',
    type: SetEntity,
  })
  update(@Param('id') id: string, @Body() updateSetsDto: UpdateSetDto) {
    this.logger.log(`Updating set with ID: ${id}`, SetsController.name);
    return this.setsService.update(id, updateSetsDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a set by its unique ID' })
  @UseGuards(OwnershipGuard)
  @ResourceType(Resource.SET)
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the set to delete',
    example: '22f0dd54-7acd-476f-9fc9-140bb5cb8b20',
  })
  @ApiNoContentResponse({
    description: 'Set deleted successfully. No content returned.',
  })
  delete(@Param('id') id: string) {
    this.logger.error(`Deleting set with ID: ${id}`, SetsController.name);
    return this.setsService.delete(id);
  }
}
