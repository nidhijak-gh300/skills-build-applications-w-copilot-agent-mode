import express, { type ErrorRequestHandler } from 'express';
import mongoose from 'mongoose';
import { connectDatabase } from './config/database.js';
import Activity from './models/Activity.js';
import Leaderboard from './models/Leaderboard.js';
import Team from './models/Team.js';
import User from './models/User.js';
import Workout from './models/Workout.js';

const app = express();
const port = Number(process.env.PORT ?? 8000);
const codespaceName = process.env.CODESPACE_NAME;
const apiBaseUrl = codespaceName
  ? `https://${codespaceName}-8000.app.github.dev`
  : 'http://localhost:8000';

app.use(express.json());

app.use((request, response, next) => {
  const origin = request.get('origin');
  const allowedOrigins = new Set([
    'http://localhost:5173',
    ...(codespaceName ? [`https://${codespaceName}-5173.app.github.dev`] : []),
  ]);

  if (origin && allowedOrigins.has(origin)) {
    response.setHeader('Access-Control-Allow-Origin', origin);
    response.setHeader('Vary', 'Origin');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }

  if (request.method === 'OPTIONS') {
    response.sendStatus(204);
    return;
  }

  next();
});

app.get('/api/health', (_request, response) => {
  const databaseConnected = mongoose.connection.readyState === 1;
  response.status(databaseConnected ? 200 : 503).json({
    status: databaseConnected ? 'ok' : 'unavailable',
    database: databaseConnected ? 'connected' : 'disconnected',
  });
});

app.get('/api/users/', async (_request, response) => {
  response.json(await User.find().sort({ name: 1 }));
});
app.post('/api/users/', async (request, response) => {
  response.status(201).json(await User.create(request.body));
});

app.get('/api/teams/', async (_request, response) => {
  response.json(await Team.find().populate('members').sort({ name: 1 }));
});
app.post('/api/teams/', async (request, response) => {
  response.status(201).json(await Team.create(request.body));
});

app.get('/api/activities/', async (request, response) => {
  const filter = typeof request.query.user === 'string' ? { user: request.query.user } : {};
  response.json(await Activity.find(filter).populate('user team').sort({ performedAt: -1 }));
});
app.post('/api/activities/', async (request, response) => {
  response.status(201).json(await Activity.create(request.body));
});

app.get('/api/leaderboard/', async (_request, response) => {
  response.json(await Leaderboard.find().populate('user team').sort({ points: -1 }));
});
app.post('/api/leaderboard/', async (request, response) => {
  response.status(201).json(await Leaderboard.create(request.body));
});

app.get('/api/workouts/', async (request, response) => {
  const query = Workout.find();
  if (typeof request.query.goal === 'string') {
    query.where('goal').equals(request.query.goal);
  }
  response.json(await query.sort({ title: 1 }));
});
app.post('/api/workouts/', async (request, response) => {
  response.status(201).json(await Workout.create(request.body));
});

app.use((_request, response) => {
  response.status(404).json({ error: 'Not found' });
});

const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  if (error instanceof mongoose.Error.ValidationError || error instanceof mongoose.Error.CastError) {
    response.status(400).json({ error: error.message });
    return;
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    error.code === 11000
  ) {
    response.status(409).json({ error: 'A record with that unique value already exists' });
    return;
  }

  console.error('API request failed:', error);
  response.status(500).json({ error: 'Internal server error' });
};

app.use(errorHandler);

export { app, apiBaseUrl };

async function startServer(): Promise<void> {
  await connectDatabase();
  app.listen(port, '0.0.0.0', () => {
    console.log(`OctoFit API listening at ${apiBaseUrl}`);
  });
}

startServer().catch((error: unknown) => {
  console.error('Unable to start OctoFit API:', error);
  process.exitCode = 1;
});
