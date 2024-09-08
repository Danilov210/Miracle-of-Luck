import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import { userRoute } from './routes/userRoute.js';
import { lotteryRoute } from './routes/lotteryRoute.js';
import { drawRoute } from './routes/drawRoute.js'; // Import draw routes
import { initializeScheduledDraws } from './controllers/drawController.js'; // Import the initialization function
import cron from 'node-cron'; // Import cron

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// Route setup
app.use('/api/user', userRoute);
app.use('/api/lotteries', lotteryRoute);
app.use('/api/draw', drawRoute); // Use draw routes

// Function to initialize scheduled draws
const initializeDrawsAndScheduleDailyCheck = async () => {
  try {
    await initializeScheduledDraws();
    console.log('Scheduled draws have been initialized successfully.');
  } catch (error) {
    console.error('Error initializing scheduled draws:', error);
  }
};

// Schedule a cron job to run every day at midnight (00:00)
cron.schedule('0 0 * * *', async () => {
  console.log('Running daily check for upcoming lotteries at 00:00...');
  // cron.schedule('0 15 * * *', async () => {
  //   console.log('Running daily check for upcoming lotteries at 15:00...');
  await initializeDrawsAndScheduleDailyCheck();
});

// Start the server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);

  // Initialize scheduled draws on server startup
  await initializeDrawsAndScheduleDailyCheck();
});