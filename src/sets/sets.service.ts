import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { UpdateSetDto } from './dto/update-set.dto';

@Injectable()
export class SetsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findOne(id: string) {
    const set = await this.databaseService.set.findUnique({
      where: { id },
    });

    if (!set) throw new NotFoundException('Set not found');

    return set;
  }

  async update(id: string, updateSetsDto: UpdateSetDto) {
    const isSetExist = await this.databaseService.set.findUnique({
      where: { id },
    });

    if (!isSetExist) throw new NotFoundException('Set not found');

    return this.databaseService.set.update({
      where: { id },
      data: updateSetsDto,
    });
  }

  delete(id: string) {
    const isSetExist = this.findOne(id);

    if (!isSetExist)
      throw new NotFoundException('Set not found or has been deleted');

    return this.databaseService.set.delete({ where: { id } });
  }
}
