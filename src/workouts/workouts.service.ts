import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class WorkoutsService {
  private workouts = [
    {
      id: 1,
      user_id: 123,
      name: 'Full Body Workout',
      date: '2024-07-02',
      notes: 'Focus on form and control.',
      duration: 60,
      exercises: [
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
      ],
    },
  ];

  public findAll() {
    return this.workouts;
  }

  public findOne(id: number) {
    const workout = this.workouts.find((workout) => workout.id === id);

    if (!workout) throw new NotFoundException('Workout not found');

    return workout;
  }

  public create(createWorkoutDto: any) {
    this.workouts.push(createWorkoutDto);
  }

  public update(id: number, updateWorkoutDto: any) {
    this.workouts = this.workouts.map((workout: any) => {
      if (workout.id === id) {
        return {
          ...workout,
          ...updateWorkoutDto,
        };
      }
    });
    return this.findOne(id);
  }

  public delete(id: number) {
    const removeWorkout = this.findOne(id);

    if (!removeWorkout)
      throw new NotFoundException('Workout not found or has been deleted');

    this.workouts = this.workouts.filter((workout) => workout.id !== id);

    return removeWorkout;
  }
}
