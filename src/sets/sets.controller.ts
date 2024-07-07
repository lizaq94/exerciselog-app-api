import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  ValidationPipe,
} from '@nestjs/common';
import { SetsService } from './sets.service';

@Controller('sets')
export class SetsController {
  constructor(private setsService: SetsService) {}

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.setsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: number, @Body(ValidationPipe) updateSetsDto: any) {
    return this.setsService.update(id, updateSetsDto);
  }

  @Delete(':id')
  delete(@Param('id') id: number) {
    return this.setsService.delete(id);
  }
}
