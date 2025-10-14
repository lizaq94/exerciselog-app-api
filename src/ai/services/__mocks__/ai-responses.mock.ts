export const MOCK_AI_RESPONSE_SINGLE_PLAN = {
  trainingPlans: [
    {
      name: 'Push Day - Upper Body Strength',
      notes:
        'Focus on chest, shoulders, and triceps. Maintain proper form throughout all exercises. Rest 90-120 seconds between sets.',
      duration: 60,
      exercises: [
        {
          order: 1,
          name: 'Dynamic Warmup',
          type: 'warmup',
          notes: 'Arm circles, shoulder rotations, light cardio for 5 minutes',
          sets: [
            {
              order: 1,
              repetitions: 0,
              weight: 0,
              durationInSeconds: 300,
              restAfterSetInSeconds: 0,
            },
          ],
        },
        {
          order: 2,
          name: 'Barbell Bench Press',
          type: 'main',
          notes:
            'Keep your back flat on the bench. Lower the bar to mid-chest level. Push explosively.',
          sets: [
            {
              order: 1,
              repetitions: 10,
              weight: 60,
              durationInSeconds: 0,
              restAfterSetInSeconds: 120,
            },
            {
              order: 2,
              repetitions: 8,
              weight: 70,
              durationInSeconds: 0,
              restAfterSetInSeconds: 120,
            },
            {
              order: 3,
              repetitions: 6,
              weight: 80,
              durationInSeconds: 0,
              restAfterSetInSeconds: 120,
            },
          ],
        },
        {
          order: 3,
          name: 'Dumbbell Shoulder Press',
          type: 'main',
          notes:
            'Press directly overhead. Keep core engaged. Control the descent.',
          sets: [
            {
              order: 1,
              repetitions: 10,
              weight: 20,
              durationInSeconds: 0,
              restAfterSetInSeconds: 90,
            },
            {
              order: 2,
              repetitions: 10,
              weight: 20,
              durationInSeconds: 0,
              restAfterSetInSeconds: 90,
            },
            {
              order: 3,
              repetitions: 8,
              weight: 22.5,
              durationInSeconds: 0,
              restAfterSetInSeconds: 90,
            },
          ],
        },
        {
          order: 4,
          name: 'Tricep Dips',
          type: 'main',
          notes:
            'Keep elbows close to body. Lower until upper arms are parallel to ground.',
          sets: [
            {
              order: 1,
              repetitions: 12,
              weight: 0,
              durationInSeconds: 0,
              restAfterSetInSeconds: 60,
            },
            {
              order: 2,
              repetitions: 10,
              weight: 0,
              durationInSeconds: 0,
              restAfterSetInSeconds: 60,
            },
            {
              order: 3,
              repetitions: 8,
              weight: 0,
              durationInSeconds: 0,
              restAfterSetInSeconds: 60,
            },
          ],
        },
        {
          order: 5,
          name: 'Chest and Shoulder Stretch',
          type: 'stretching',
          notes: 'Hold each stretch for 30 seconds. Breathe deeply.',
          sets: [
            {
              order: 1,
              repetitions: 0,
              weight: 0,
              durationInSeconds: 180,
              restAfterSetInSeconds: 0,
            },
          ],
        },
      ],
    },
  ],
};

export const MOCK_AI_RESPONSE_PUSH_PULL_LEGS = {
  trainingPlans: [
    {
      name: 'Training A - Push',
      notes:
        'Focus on pushing movements: chest, shoulders, triceps. Technique is more important than weight.',
      duration: 60,
      exercises: [
        {
          order: 1,
          name: 'Dynamic Warmup',
          type: 'warmup',
          notes: 'Prepare your upper body muscles',
          sets: [
            {
              order: 1,
              repetitions: 0,
              weight: 0,
              durationInSeconds: 300,
              restAfterSetInSeconds: 0,
            },
          ],
        },
        {
          order: 2,
          name: 'Bench Press',
          type: 'main',
          notes: 'Control the descent, explosive push',
          sets: [
            {
              order: 1,
              repetitions: 10,
              weight: 60,
              durationInSeconds: 0,
              restAfterSetInSeconds: 90,
            },
            {
              order: 2,
              repetitions: 10,
              weight: 60,
              durationInSeconds: 0,
              restAfterSetInSeconds: 90,
            },
            {
              order: 3,
              repetitions: 8,
              weight: 65,
              durationInSeconds: 0,
              restAfterSetInSeconds: 90,
            },
          ],
        },
        {
          order: 3,
          name: 'Overhead Press',
          type: 'main',
          notes: 'Keep core tight',
          sets: [
            {
              order: 1,
              repetitions: 10,
              weight: 40,
              durationInSeconds: 0,
              restAfterSetInSeconds: 90,
            },
            {
              order: 2,
              repetitions: 10,
              weight: 40,
              durationInSeconds: 0,
              restAfterSetInSeconds: 90,
            },
          ],
        },
        {
          order: 4,
          name: 'Cool Down Stretches',
          type: 'stretching',
          notes: 'Relax and stretch',
          sets: [
            {
              order: 1,
              repetitions: 0,
              weight: 0,
              durationInSeconds: 180,
              restAfterSetInSeconds: 0,
            },
          ],
        },
      ],
    },
    {
      name: 'Training B - Pull',
      notes:
        'Focus on pulling movements: back, biceps. Engage your back muscles properly.',
      duration: 60,
      exercises: [
        {
          order: 1,
          name: 'Dynamic Warmup',
          type: 'warmup',
          notes: 'Prepare back and arm muscles',
          sets: [
            {
              order: 1,
              repetitions: 0,
              weight: 0,
              durationInSeconds: 300,
              restAfterSetInSeconds: 0,
            },
          ],
        },
        {
          order: 2,
          name: 'Pull-ups',
          type: 'main',
          notes: 'Full range of motion',
          sets: [
            {
              order: 1,
              repetitions: 8,
              weight: 0,
              durationInSeconds: 0,
              restAfterSetInSeconds: 120,
            },
            {
              order: 2,
              repetitions: 7,
              weight: 0,
              durationInSeconds: 0,
              restAfterSetInSeconds: 120,
            },
            {
              order: 3,
              repetitions: 6,
              weight: 0,
              durationInSeconds: 0,
              restAfterSetInSeconds: 120,
            },
          ],
        },
        {
          order: 3,
          name: 'Barbell Rows',
          type: 'main',
          notes: 'Keep back straight, pull to lower chest',
          sets: [
            {
              order: 1,
              repetitions: 10,
              weight: 50,
              durationInSeconds: 0,
              restAfterSetInSeconds: 90,
            },
            {
              order: 2,
              repetitions: 10,
              weight: 50,
              durationInSeconds: 0,
              restAfterSetInSeconds: 90,
            },
          ],
        },
        {
          order: 4,
          name: 'Cool Down Stretches',
          type: 'stretching',
          notes: 'Stretch back and arms',
          sets: [
            {
              order: 1,
              repetitions: 0,
              weight: 0,
              durationInSeconds: 180,
              restAfterSetInSeconds: 0,
            },
          ],
        },
      ],
    },
    {
      name: 'Training C - Legs',
      notes:
        'Focus on lower body: quads, hamstrings, glutes. Go deep on squats.',
      duration: 60,
      exercises: [
        {
          order: 1,
          name: 'Dynamic Warmup',
          type: 'warmup',
          notes: 'Leg swings, hip circles, light cardio',
          sets: [
            {
              order: 1,
              repetitions: 0,
              weight: 0,
              durationInSeconds: 300,
              restAfterSetInSeconds: 0,
            },
          ],
        },
        {
          order: 2,
          name: 'Barbell Squats',
          type: 'main',
          notes: 'Squat to parallel or below, keep chest up',
          sets: [
            {
              order: 1,
              repetitions: 10,
              weight: 80,
              durationInSeconds: 0,
              restAfterSetInSeconds: 120,
            },
            {
              order: 2,
              repetitions: 10,
              weight: 80,
              durationInSeconds: 0,
              restAfterSetInSeconds: 120,
            },
            {
              order: 3,
              repetitions: 8,
              weight: 90,
              durationInSeconds: 0,
              restAfterSetInSeconds: 120,
            },
          ],
        },
        {
          order: 3,
          name: 'Romanian Deadlifts',
          type: 'main',
          notes: 'Feel the stretch in hamstrings',
          sets: [
            {
              order: 1,
              repetitions: 10,
              weight: 60,
              durationInSeconds: 0,
              restAfterSetInSeconds: 90,
            },
            {
              order: 2,
              repetitions: 10,
              weight: 60,
              durationInSeconds: 0,
              restAfterSetInSeconds: 90,
            },
          ],
        },
        {
          order: 4,
          name: 'Cool Down Stretches',
          type: 'stretching',
          notes: 'Stretch quads, hamstrings, hips',
          sets: [
            {
              order: 1,
              repetitions: 0,
              weight: 0,
              durationInSeconds: 240,
              restAfterSetInSeconds: 0,
            },
          ],
        },
      ],
    },
  ],
};

export const MOCK_AI_RESPONSE_BODYWEIGHT = {
  trainingPlans: [
    {
      name: 'Bodyweight Circuit - No Equipment',
      notes:
        'Perfect for home workouts. No equipment needed. Focus on form and controlled movements.',
      duration: 30,
      exercises: [
        {
          order: 1,
          name: 'Jumping Jacks',
          type: 'warmup',
          notes: 'Get your heart rate up',
          sets: [
            {
              order: 1,
              repetitions: 50,
              weight: 0,
              durationInSeconds: 0,
              restAfterSetInSeconds: 30,
            },
          ],
        },
        {
          order: 2,
          name: 'Push-ups',
          type: 'main',
          notes: 'Keep body in straight line',
          sets: [
            {
              order: 1,
              repetitions: 15,
              weight: 0,
              durationInSeconds: 0,
              restAfterSetInSeconds: 45,
            },
            {
              order: 2,
              repetitions: 12,
              weight: 0,
              durationInSeconds: 0,
              restAfterSetInSeconds: 45,
            },
            {
              order: 3,
              repetitions: 10,
              weight: 0,
              durationInSeconds: 0,
              restAfterSetInSeconds: 45,
            },
          ],
        },
        {
          order: 3,
          name: 'Bodyweight Squats',
          type: 'main',
          notes: 'Squat deep, chest up',
          sets: [
            {
              order: 1,
              repetitions: 20,
              weight: 0,
              durationInSeconds: 0,
              restAfterSetInSeconds: 45,
            },
            {
              order: 2,
              repetitions: 20,
              weight: 0,
              durationInSeconds: 0,
              restAfterSetInSeconds: 45,
            },
          ],
        },
        {
          order: 4,
          name: 'Plank Hold',
          type: 'main',
          notes: 'Keep core tight, body straight',
          sets: [
            {
              order: 1,
              repetitions: 0,
              weight: 0,
              durationInSeconds: 60,
              restAfterSetInSeconds: 30,
            },
            {
              order: 2,
              repetitions: 0,
              weight: 0,
              durationInSeconds: 45,
              restAfterSetInSeconds: 30,
            },
          ],
        },
        {
          order: 5,
          name: 'Full Body Stretch',
          type: 'stretching',
          notes: 'Stretch all major muscle groups',
          sets: [
            {
              order: 1,
              repetitions: 0,
              weight: 0,
              durationInSeconds: 300,
              restAfterSetInSeconds: 0,
            },
          ],
        },
      ],
    },
  ],
};

export const MOCK_AI_RESPONSE_MINIMAL = {
  trainingPlans: [
    {
      name: 'Quick Session',
      notes: 'Short and effective',
      duration: 20,
      exercises: [
        {
          order: 1,
          name: 'Quick Exercise',
          type: 'main',
          notes: 'Just do it',
          sets: [
            {
              order: 1,
              repetitions: 10,
              weight: 0,
              durationInSeconds: 0,
              restAfterSetInSeconds: 60,
            },
          ],
        },
      ],
    },
  ],
};

export const MOCK_AI_RESPONSE_EDGE_CASE = {
  trainingPlans: [
    {
      name: 'Marathon Endurance Session',
      notes: 'Very long workout for advanced athletes',
      duration: 240,
      exercises: [
        {
          order: 1,
          name: 'Extended Cardio',
          type: 'main',
          notes: 'Stay hydrated',
          sets: [
            {
              order: 1,
              repetitions: 0,
              weight: 0,
              durationInSeconds: 7200,
              restAfterSetInSeconds: 300,
            },
          ],
        },
      ],
    },
  ],
};

export const getAiResponseJson = (mockData: any): string => {
  return JSON.stringify(mockData);
};

export const RAW_AI_RESPONSES = {
  singlePlan: getAiResponseJson(MOCK_AI_RESPONSE_SINGLE_PLAN),
  pushPullLegs: getAiResponseJson(MOCK_AI_RESPONSE_PUSH_PULL_LEGS),
  bodyweight: getAiResponseJson(MOCK_AI_RESPONSE_BODYWEIGHT),
  minimal: getAiResponseJson(MOCK_AI_RESPONSE_MINIMAL),
  edgeCase: getAiResponseJson(MOCK_AI_RESPONSE_EDGE_CASE),
};
