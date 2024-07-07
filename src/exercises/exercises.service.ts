import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateExerciseDto } from './dto/create-exercise.dto';
import { UpdateExerciseDto } from './dto/update-exercise.dto';

@Injectable()
export class ExercisesService {
  private exercises = [
    {
      id: 1,
      name: 'Bench Press',
      order: 1,
      type: 'Strength',
      notes: 'Warm up properly before starting.',
      sets: [
        {
          id: 1,
          repetitions: 10,
          weight: 80,
          order: 1,
        },
      ],
    },
  ];

  findAll() {
    return this.exercises;
  }

  findOne(id: number) {
    const exercise = this.exercises.find((exercise) => {
      console.log(exercise.id);
      return exercise.id === id;
    });

    if (!exercise) throw new NotFoundException('Exercise not found');

    return exercise;
  }

  create(creatExerciseDto: CreateExerciseDto) {
    return creatExerciseDto;
  }

  update(id: number, updateExerciseDto: UpdateExerciseDto) {
    return id;
  }

  delete(id: number) {
    return id;
  }
}
