import { model, Schema } from 'mongoose';

const activitySchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    team: { type: Schema.Types.ObjectId, ref: 'Team' },
    type: {
      type: String,
      enum: ['running', 'walking', 'cycling', 'swimming', 'strength', 'yoga', 'other'],
      default: 'other',
    },
    durationMinutes: { type: Number, required: true, min: 1 },
    distanceKm: { type: Number, min: 0 },
    points: { type: Number, min: 0, default: 0 },
    performedAt: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

const Activity = model('Activity', activitySchema);

export default Activity;
