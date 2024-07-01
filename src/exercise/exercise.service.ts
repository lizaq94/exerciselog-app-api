import { Injectable } from '@nestjs/common';

@Injectable()
export class ExerciseService {
  findAll() {
    return [];
  }
  findOne(id: number) {
    return id;
  }
  create(creatExerciseDto: any) {
    return creatExerciseDto;
  }
  update(id: number, updateExerciseDto: any) {
    return id;
  }
  delete(id: number) {
    return id;
  }
}
