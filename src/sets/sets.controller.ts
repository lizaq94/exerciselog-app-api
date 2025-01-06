import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ResourceType } from '../casl/decorators/resource-type.decorator';
import { OwnershipGuard } from '../casl/guards/ownership.guard';
import { Resource } from '../casl/types/resource.type';
import { UpdateSetDto } from './dto/update-set.dto';
import { SetsService } from './sets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SetEntity } from './entities/set.entity';

@UseGuards(JwtAuthGuard)
@Controller('sets')
@ApiTags('sets')
export class SetsController {
  constructor(private setsService: SetsService) {}

  @Get(':id')
  @ApiOkResponse({ type: SetEntity })
  findOne(@Param('id') id: string) {
    return this.setsService.findOne(id);
  }

  @Patch(':id')
  @UseGuards(OwnershipGuard)
  @ResourceType(Resource.SET)
  @ApiBody({ type: UpdateSetDto })
  @ApiOkResponse({ type: SetEntity })
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateSetsDto: UpdateSetDto,
  ) {
    return this.setsService.update(id, updateSetsDto);
  }

  @Delete(':id')
  @UseGuards(OwnershipGuard)
  @ResourceType(Resource.SET)
  @ApiOkResponse({ type: SetEntity })
  delete(@Param('id') id: string) {
    return this.setsService.delete(id);
  }
}
