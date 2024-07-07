import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class SetsService {
  public sets = [
    {
      id: 1,
      repetitions: 10,
      weight: 80,
      order: 1,
    },
    {
      id: 1,
      repetitions: 10,
      weight: 80,
      order: 1,
    },
    {
      id: 1,
      repetitions: 10,
      weight: 80,
      order: 1,
    },
  ];

  findOne(id: number) {
    const sets = this.sets.find((sets) => {
      return sets.id === id;
    });

    if (!sets) throw new NotFoundException('Sets not found');

    return sets;
  }

  update(id: number, updateSetsDto: any) {
    return id;
  }

  delete(id: number) {
    return id;
  }
}
