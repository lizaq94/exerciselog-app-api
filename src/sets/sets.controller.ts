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
import { ApiTags } from '@nestjs/swagger';
import { UpdateSetDto } from './dto/update-set.dto';
import { SetsService } from './sets.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SetOwnershipGuard } from './set-ownership.guard';

@UseGuards(JwtAuthGuard)
@Controller('sets')
@ApiTags('sets')
export class SetsController {
  constructor(private setsService: SetsService) {}

  @Get(':id')
  @UseGuards(SetOwnershipGuard)
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
