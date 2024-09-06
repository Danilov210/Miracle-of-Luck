import cron from 'node-cron';
import { prisma } from "../config/prismaConfig.js";

const scheduledJobs = new Map(); // To keep track of scheduled jobs

// Function to convert draw time to cron format
const convertToCronTime = (drawTime) => {
  const [hour, minute] = drawTime.split(':');
  return `${minute} ${hour} * * *`;
};

// Controller function to schedule a new lottery draw
export const scheduleDraw = async (req, res) => {
  try {
    const { id } = req.body; // Correctly extract lottery ID from the request body
    console.log("Request body:", req.body);

    // Check if the ID is provided
    if (!id) {
      return res.status(400).json({ message: 'Lottery ID is required.' });
    }

    // Fetch lottery data from the database for all possible types, with a filter for Open status
    let lottery = await prisma.lotteryLike.findUnique({
      where: { 
        id,
        lotteryStatus: 'Open', // Ensure only open lotteries are fetched
      },
      select: { id: true, endDate: true }
    });

    if (!lottery) {
      lottery = await prisma.lotteryFundraising.findUnique({
        where: { 
          id,
          lotteryStatus: 'Open', // Ensure only open lotteries are fetched
        },
        select: { 
          id: true, 
          endDate: true,
        }
      });
    }

    if (!lottery) {
      lottery = await prisma.lotteryClassic.findUnique({
        where: { 
          id,
          lotteryStatus: 'Open', // Ensure only open lotteries are fetched
        },
        select: { id: true, endDate: true }
      });
    }

    // If no lottery is found, return an error
    if (!lottery) {
      return res.status(404).json({ message: 'Open lottery not found.' });
    }

    console.log("Fetched lottery data:", lottery);

    // Convert endDate to a valid time string (HH:mm) in the local timezone
    const drawTime = new Date(lottery.endDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    // Schedule the draw for the specific lottery
    scheduleLotteryDraw({ id, drawTime });

    res.status(200).json({ message: 'Lottery draw scheduled successfully.' });
  } catch (error) {
    console.error("Error scheduling lottery draw:", error);
    res.status(500).json({ message: 'Failed to schedule lottery draw.', error });
  }
};
// Function to schedule a lottery draw
const scheduleLotteryDraw = ({ id, drawTime }) => {
  const cronTime = convertToCronTime(drawTime);

  // If a job already exists for this lottery ID, stop it
  if (scheduledJobs.has(id)) {
    const existingJob = scheduledJobs.get(id);
    existingJob.stop();
    scheduledJobs.delete(id);
  }

  // Schedule a new cron job
  const job = cron.schedule(cronTime, async () => {
    console.log(`Running scheduled lottery draw for Lottery ID: ${id}`);
    const winner = await performLotteryDraw(id);

    if (winner) {
      console.log(`The winner is ${winner.name} for lottery ID ${id}`);
      // Additional logic like saving to a database or notifying the winner
    } else {
      console.log(`No participants in the lottery ID: ${id}`);
    }
  });

  // Store the job in the map
  scheduledJobs.set(id, job);
  console.log(`Scheduled lottery ID ${id} to run at ${drawTime}`);
};


// Controller function to handle all lottery updates dynamically
export const handleLotteryUpdates = async (req, res) => {
  try {
    const lotteries = await getLotteriesWithDrawTimes(); // Fetch current lotteries from the database

    lotteries.forEach((lottery) => {
      scheduleLotteryDraw(lottery); // Schedule each lottery dynamically
    });

    res.status(200).json({ message: 'Handled lottery updates successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to handle lottery updates.', error });
  }
};

//++ Controller function to fetch all lotteries with draw times and return them in the response
export const fetchAndReturnLotteries = async (req, res) => {
    try {
      // Fetch lotteries from the database
      const likeLotteries = await prisma.lotteryLike.findMany({
        where: { lotteryStatus: 'Open' },
        select: { id: true, endDate: true },
      });
  
      const fundraisingLotteries = await prisma.lotteryFundraising.findMany({
        where: { lotteryStatus: 'Open' },
        select: { id: true, endDate: true },
      });
  
      const classicLotteries = await prisma.lotteryClassic.findMany({
        where: { lotteryStatus: 'Open' },
        select: { id: true, endDate: true },
      });
  
      // Combine all lotteries into one array
      const allLotteries = [
        ...likeLotteries.map(lottery => ({ ...lottery, type: 'Like' })),
        ...fundraisingLotteries.map(lottery => ({ ...lottery, type: 'Fundraising' })),
        ...classicLotteries.map(lottery => ({ ...lottery, type: 'Classic' })),
      ];
  
      // Return the combined lotteries as a response
      res.status(200).json(allLotteries);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch lotteries.', error });
    }
  };

// Function to perform a lottery draw
const performLotteryDraw = async (lotteryId) => {
    try {
      // Fetch participants from the database based on the lottery ID
      const participants = await fetchParticipantsFromDatabase(lotteryId); // Replace with your actual database fetching logic
  
      if (participants.length === 0) {
        console.log(`No participants found for lottery ID: ${lotteryId}`);
        return null; // No participants, no winner
      }
  
      // Randomly select a winner from the participants
      const randomIndex = Math.floor(Math.random() * participants.length);
      const winner = participants[randomIndex];
  
      console.log(`The winner for lottery ID ${lotteryId} is: ${winner.name}`);
      return winner; // Return the winner object
    } catch (error) {
      console.error(`Error performing lottery draw for lottery ID ${lotteryId}:`, error);
      throw error; // Throw the error to be handled by the calling function
    }
  };
  
// Function to fetch participants from the database based on lottery ID
const fetchParticipantsFromDatabase = async (lotteryId) => {
    try {
      // Query the Ticket model to find all tickets associated with the given lottery ID
      const tickets = await prisma.ticket.findMany({
        where: {
          lotteryId: lotteryId, // Match the given lottery ID
          status: 'Active', // Optionally filter by active status if needed
        },
        include: {
          user: true, // Include the related user data to get participant information
        },
      });
  
      // Extract participants (users) from the fetched tickets
      const participants = tickets.map(ticket => ({
        id: ticket.user.id,
        name: ticket.user.fullName || `${ticket.user.firstName} ${ticket.user.lastName}`,
        email: ticket.user.email,
      }));
  
      return participants; // Return the list of participants
  
    } catch (error) {
      console.error(`Error fetching participants for lottery ID ${lotteryId}:`, error);
      throw error; // Throw the error to be handled by the calling function
    }
  };