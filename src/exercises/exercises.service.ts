import { Injectable, NotFoundException } from '@nestjs/common';
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

  findOne(id: number) {
    const exercise = this.exercises.find((exercise) => {
      console.log(exercise.id);
      return exercise.id === id;
    });

    if (!exercise) throw new NotFoundException('Exercise not found');

    return exercise;
  }

  update(id: number, updateExerciseDto: UpdateExerciseDto) {
    return id;
  }

  delete(id: number) {
    return id;
  }
}
