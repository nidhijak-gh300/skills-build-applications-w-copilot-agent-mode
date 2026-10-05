import { model, Schema } from 'mongoose';

const workoutSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    goal: {
      type: String,
      enum: ['endurance', 'strength', 'flexibility', 'general'],
      default: 'general',
    },
    activityType: { type: String, required: true, trim: true },
    difficulty: { type: String, enum: ['beginner', 'intermediate', 'advanced'], default: 'beginner' },
    durationMinutes: { type: Number, required: true, min: 1 },
  },
  { timestamps: true },
);

const Workout = model('Workout', workoutSchema);

export default Workout;
