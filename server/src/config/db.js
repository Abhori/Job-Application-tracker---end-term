import mongoose from 'mongoose';
import { config } from './env.js';

let mongodInstance = null;

export const connectDB = async () => {
  try {
    let mongoUri = config.MONGODB_URI;

    // If no external MONGODB_URI is provided or if in test, spin up MongoMemoryServer
    if (!mongoUri || process.env.NODE_ENV === 'test') {
      try {
        const { MongoMemoryServer } = await import('mongodb-memory-server');
        mongodInstance = await MongoMemoryServer.create();
        mongoUri = mongodInstance.getUri();
        console.log(`[Database] Using in-memory MongoDB at: ${mongoUri}`);
      } catch (memErr) {
        console.warn('[Database] mongodb-memory-server not available, falling back to local MongoDB URI');
        mongoUri = 'mongodb://127.0.0.1:27017/applytrack';
      }
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`[Database] Connected to MongoDB: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Connection failed: ${error.message}`);
    if (process.env.NODE_ENV !== 'test') {
      process.exit(1);
    }
    throw error;
  }
};

export const disconnectDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
    console.log('[Database] Disconnected from MongoDB');
  } catch (error) {
    console.error(`[Database Error] Disconnect failed: ${error.message}`);
  }
};
