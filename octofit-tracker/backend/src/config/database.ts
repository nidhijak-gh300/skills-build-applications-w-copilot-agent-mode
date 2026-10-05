import mongoose from 'mongoose';

const defaultConnectionString = 'mongodb://localhost:27017/octofit_db';

export async function connectDatabase(): Promise<void> {
  const connectionString = process.env.MONGODB_URI ?? defaultConnectionString;
  await mongoose.connect(connectionString);
  console.log('Connected to octofit_db');
}

export default mongoose.connection;
