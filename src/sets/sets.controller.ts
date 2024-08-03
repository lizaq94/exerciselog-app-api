import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UpdateSetDto } from './dto/update-set.dto';
import { SetsService } from './sets.service';

@Controller('sets')
@ApiTags('sets')
export class SetsController {
  constructor(private setsService: SetsService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.setsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateSetsDto: UpdateSetDto,
  ) {
    return this.setsService.update(id, updateSetsDto);
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.setsService.delete(id);
  }
}
