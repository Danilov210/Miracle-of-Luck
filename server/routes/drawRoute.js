import express from 'express';
import {
  scheduleDraw,
  handleLotteryUpdates,
  fetchAndReturnLotteries
} from '../controllers/drawController.js'; // Import the controller functions

const router = express.Router();

// Define routes for lottery draw actions

// Route to schedule a new draw
router.post('/scheduleDraw', scheduleDraw);

// Route to handle all lottery updates dynamically
router.post('/handleUpdates', handleLotteryUpdates);
// Route to get all lotteries with draw times (optional)
router.get('/getAllLotteries', fetchAndReturnLotteries);

export { router as drawRoute };
