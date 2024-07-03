import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ExerciseService {
  private exercises = [
    {
      id: 1,
      name: 'Bench Press',
      sets: [
        { reps: 5, weight: 50 },
        { reps: 5, weight: 55 },
        { reps: 5, weight: 65 },
        { reps: 5, weight: 70 },
      ],
      time: 20233,
    },
    {
      id: 2,
      name: 'Bar Dip',
      sets: [
        { reps: 5, weight: 50 },
        { reps: 5, weight: 55 },
        { reps: 5, weight: 65 },
        { reps: 5, weight: 70 },
      ],
      time: 20333,
    },
    {
      id: 3,
      name: 'Board Press',
      sets: [
        { reps: 5, weight: 50 },
        { reps: 5, weight: 55 },
        { reps: 5, weight: 65 },
        { reps: 5, weight: 70 },
      ],
      time: 20232,
    },
  ];
  findAll() {
    return this.exercises;
  }

  findOne(id: number) {
    console.log('Kamil id', id);
    const exercise = this.exercises.find((exercise) => {
      console.log(exercise.id);
      return exercise.id === id;
    });

    if (!exercise) throw new NotFoundException('Exercise not found');

    return exercise;
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
