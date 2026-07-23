import mongoose from 'mongoose';
import { env } from './env.js';

export const connectDB = async () => {
  const maxRetries = 5;
  let retries = 0;
  let delay = 1000;

  mongoose.connection.on('connected', () => {
    console.log('MongoDB connected successfully');
  });

  mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('MongoDB connection error:', err);
  });

  while (retries < maxRetries) {
    try {
      await mongoose.connect(env.MONGODB_URI,{
        tls:true,
      });
      return;
    } catch (error) {
      retries++;
      console.error(`MongoDB connection failed (Attempt ${retries}/${maxRetries}):`, error);
      
      if (retries === maxRetries) {
        console.error('Max retries reached. Exiting...');
        process.exit(1);
      }
      
      await new Promise(res => setTimeout(res, delay));
      delay *= 2; // Exponential backoff
    }
  }
};
