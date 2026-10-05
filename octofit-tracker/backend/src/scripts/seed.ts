import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import activity from '../models/Activity.js';
import leaderboard from '../models/Leaderboard.js';
import team from '../models/Team.js';
import user from '../models/User.js';
import workout from '../models/Workout.js';

/**
 * Seed the octofit_db database with test data.
 */
async function seedDatabase(): Promise<void> {
  try {
    await connectDatabase();

    const userData = [
      { name: 'Avery Morgan', username: 'avery.morgan', email: 'avery@example.com' },
      { name: 'Jordan Lee', username: 'jordan.lee', email: 'jordan@example.com' },
      { name: 'Sam Rivera', username: 'sam.rivera', email: 'sam@example.com' },
      { name: 'Taylor Kim', username: 'taylor.kim', email: 'taylor@example.com' },
    ];
    const workoutData = [
      {
        title: 'Steady 5K Run',
        description: 'Build aerobic endurance with a comfortable, conversational-pace run.',
        goal: 'endurance',
        activityType: 'running',
        difficulty: 'beginner',
        durationMinutes: 35,
      },
      {
        title: 'Full-Body Strength',
        description: 'A balanced bodyweight circuit covering the major muscle groups.',
        goal: 'strength',
        activityType: 'strength',
        difficulty: 'intermediate',
        durationMinutes: 40,
      },
      {
        title: 'Mobility and Recovery',
        description: 'Gentle stretches and mobility drills to support recovery and flexibility.',
        goal: 'flexibility',
        activityType: 'yoga',
        difficulty: 'beginner',
        durationMinutes: 25,
      },
    ];
    const sampleUsernames = userData.map((sampleUser) => sampleUser.username);
    const sampleUsers = await user.find({ username: { $in: sampleUsernames } }).select('_id');
    const sampleUserIds = sampleUsers.map((sampleUser) => sampleUser._id);

    await Promise.all([
      activity.deleteMany({ user: { $in: sampleUserIds } }),
      leaderboard.deleteMany({ user: { $in: sampleUserIds } }),
      team.deleteMany({ name: { $in: ['Trail Blazers', 'Morning Movers'] } }),
      user.deleteMany({ username: { $in: sampleUsernames } }),
      workout.deleteMany({ title: { $in: workoutData.map((item) => item.title) } }),
    ]);

    const users = await user.create(userData);
    const [avery, jordan, sam, taylor] = users;
    if (!avery || !jordan || !sam || !taylor) {
      throw new Error('Unable to create all sample users');
    }

    const teams = await team.create([
      { name: 'Trail Blazers', members: [avery._id, jordan._id], points: 420 },
      { name: 'Morning Movers', members: [sam._id, taylor._id], points: 365 },
    ]);
    const [trailBlazers, morningMovers] = teams;
    if (!trailBlazers || !morningMovers) {
      throw new Error('Unable to create all sample teams');
    }

    await activity.insertMany([
      {
        user: avery._id,
        team: trailBlazers._id,
        type: 'running',
        durationMinutes: 35,
        distanceKm: 5.2,
        points: 105,
        performedAt: new Date('2026-10-03T07:30:00.000Z'),
      },
      {
        user: jordan._id,
        team: trailBlazers._id,
        type: 'cycling',
        durationMinutes: 50,
        distanceKm: 18,
        points: 125,
        performedAt: new Date('2026-10-04T08:00:00.000Z'),
      },
      {
        user: sam._id,
        team: morningMovers._id,
        type: 'walking',
        durationMinutes: 45,
        distanceKm: 3.8,
        points: 80,
        performedAt: new Date('2026-10-03T06:45:00.000Z'),
      },
      {
        user: taylor._id,
        team: morningMovers._id,
        type: 'strength',
        durationMinutes: 40,
        points: 115,
        performedAt: new Date('2026-10-04T07:15:00.000Z'),
      },
    ]);

    await leaderboard.insertMany([
      { user: avery._id, team: trailBlazers._id, points: 245 },
      { user: jordan._id, team: trailBlazers._id, points: 175 },
      { user: sam._id, team: morningMovers._id, points: 210 },
      { user: taylor._id, team: morningMovers._id, points: 155 },
    ]);

    await workout.insertMany(workoutData);

    const [userCount, teamCount, activityCount, leaderboardCount, workoutCount] =
      await Promise.all([
        user.countDocuments(),
        team.countDocuments(),
        activity.countDocuments(),
        leaderboard.countDocuments(),
        workout.countDocuments(),
      ]);
    console.log(
      `Database seeding complete: ${userCount} users, ${teamCount} teams, ` +
        `${activityCount} activities, ${leaderboardCount} leaderboard entries, ` +
        `${workoutCount} workouts`,
    );
  } finally {
    await mongoose.disconnect();
  }
}

seedDatabase().catch((error: unknown) => {
  console.error('Error seeding database:', error);
  process.exitCode = 1;
});
