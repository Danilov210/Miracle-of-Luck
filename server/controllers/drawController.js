import cron from 'node-cron';
import { prisma } from "../config/prismaConfig.js";
import axios from 'axios'; // Import axios for making HTTP requests
import Users from '../data/Users.js'; // Import the mock data file containing user information

const scheduledJobs = new Map(); // To keep track of scheduled jobs

// Function to generate unique random numbers for classic lottery
const generateUniqueRandomNumbers = (count, range) => {
  const numbers = new Set();
  while (numbers.size < count) {
    numbers.add(Math.floor(Math.random() * range) + 1);
  }
  return Array.from(numbers);
};

// Function to determine winners for the classic lottery
const determineClassicLotteryWinners = (tickets, winningNumbers, prizes) => {
  const winners = [];

  // Log the input data for debugging
  console.log("Fetched prizes:", prizes);
  console.log("Fetched tickets:", tickets);
  console.log("Drawing numbers:", winningNumbers);

  // Calculate the minimum number of matching numbers required to win a prize
  const requiredMatchingCountForPrize = winningNumbers.length - prizes.length;

  // Ensure all tickets have the 'numbers' property defined correctly
  const sortedTickets = tickets.map(ticket => {
    const ticketNumbers = Array.isArray(ticket.numbers) ? ticket.numbers : [];

    // Calculate how many numbers match with the winning numbers
    const matchingCount = ticketNumbers.reduce((count, number) => {
      if (winningNumbers.includes(number)) {
        return count + 1;
      }
      return count;
    }, 0);

    console.log(`Ticket ID: ${ticket.id}, Numbers: ${ticketNumbers}, Matching Count: ${matchingCount}`);

    return { ...ticket, matchingCount };
  }).sort((a, b) => b.matchingCount - a.matchingCount); // Sort by the number of matching numbers in descending order

  console.log('Sorted Tickets by Matching Count:', sortedTickets);

  // Assign prizes to the top matching tickets
  let prizeIndex = 0; // Initialize the prize index

  // Iterate through all sorted tickets to find winners
  for (let i = 0; i < sortedTickets.length; i++) {
    const ticket = sortedTickets[i];

    // Skip tickets that do not meet the minimum criteria to win a prize
    if (ticket.matchingCount < requiredMatchingCountForPrize) {
      console.log(`Ticket ID ${ticket.id} does not meet the criteria to win (Matching Count: ${ticket.matchingCount} / Required: ${requiredMatchingCountForPrize}).`);
      continue; // Move to the next ticket
    }

    // Iterate through all possible prize positions
    for (let j = 0; j < prizes.length; j++) {
      // Check if the ticket has the required number of matches for the current prize
      if (ticket.matchingCount === winningNumbers.length - j) {
        winners.push({
          id: ticket.id,
          email: ticket.email || 'N/A',
          ticketNumber: ticket.ticketNumber,
          fullName: ticket.fullName || 'N/A',
          place: j + 1, // Dynamic place assignment
          prize: prizes[j], // Assign prize from the current prize index
          matchingCount: ticket.matchingCount,
        });

        console.log(`Winner Found - Ticket ID: ${ticket.id}, Name: ${ticket.fullName || 'N/A'}, Matching Count: ${ticket.matchingCount}, Prize: ${JSON.stringify(prizes[j])}`);
        break; // Break after assigning a prize to avoid assigning multiple prizes to the same ticket
      }
    }
  }

  // Log final winners
  console.log('Final Winners:', winners);

  return winners;
};

// Function to perform classic lottery draw
const performClassicLotteryDraw = async (lotteryId) => {
  try {
    const lottery = await prisma.lotteryClassic.findUnique({
      where: { id: lotteryId },
      select: { availableNumberRange: true, drawnNumbersCount: true, prizes: true },
    });

    if (!lottery) {
      console.log(`Lottery ID ${lotteryId} not found.`);
      return null;
    }

    // Generate unique random winning numbers
    const winningNumbers = generateUniqueRandomNumbers(lottery.drawnNumbersCount, lottery.availableNumberRange);

    // Fetch participants and their tickets
    const participants = await fetchParticipantsFromDatabase(lotteryId);

    if (participants.length === 0) {
      console.log(`No participants found for lottery ID: ${lotteryId}`);
      return null; // No participants, no winner
    }

    // Determine winners based on matching numbers
    const winners = determineClassicLotteryWinners(participants, winningNumbers, lottery.prizes);

    if (winners.length === 0) {
      console.log(`No winners for lottery ID: ${lotteryId}`);
    } else {
      console.log(`Winners for lottery ID ${lotteryId}:`, winners);
    }

    const winnersData = winners.map((winner) => ({
      place: winner.place,
      ticketId: winner.ticketNumber,
      fullName: winner.fullName,
      email: winner.email,

    }));

    // Update lottery with winners and winning numbers
    await updateLotteryWinners(lotteryId, 'Classic', participants.length, winnersData);
    await prisma.lotteryClassic.update({
      where: { id: lotteryId },
      data: { winningNumbers, lotteryStatus: 'Closed' },
    });

    // Update ticket statuses
    await updateTicketStatuses(lotteryId, winners);

    return winners;
  } catch (error) {
    console.error(`Error performing classic lottery draw for lottery ID ${lotteryId}:`, error);
    throw error;
  }
};

// Controller function to schedule a new lottery draw
export const scheduleDraw = async (req, res) => {
  try {
    const { id } = req.body;
    console.log("Request body:", req.body);

    if (!id) {
      return res.status(400).json({ message: 'Lottery ID is required.' });
    }

    const { lottery, lotteryType } = await fetchLotteryDetails(id);

    if (!lottery) {
      return res.status(404).json({ message: 'Open lottery not found.' });
    }

    console.log("Fetched lottery data:", lottery);

    // Ensure endDate is a full date-time string
    const drawTime = new Date(lottery.endDate);

    if (isNaN(drawTime.getTime())) {
      console.error(`Invalid endDate format for lottery ID ${id}:`, lottery.endDate);
      return res.status(400).json({ message: 'Invalid endDate format. Please provide a full date and time.' });
    }

    scheduleLotteryDraw({ id, drawTime: drawTime.toISOString(), lotteryType });

    res.status(200).json({ message: 'Lottery draw scheduled successfully.' });
  } catch (error) {
    console.error("Error scheduling lottery draw:", error);
    res.status(500).json({ message: 'Failed to schedule lottery draw.', error });
  }
};

// Function to fetch lottery details and type
const fetchLotteryDetails = async (id) => {
  let lottery;
  let lotteryType;

  lottery = await prisma.lotteryLike.findFirst({ where: { id, lotteryStatus: 'Open' }, select: { id: true, endDate: true } });
  if (lottery) {
    return { lottery, lotteryType: 'Like' };
  }
  lottery = await prisma.lotteryFundraising.findFirst({ where: { id, lotteryStatus: 'Open' }, select: { id: true, endDate: true } });
  if (lottery) {
    return { lottery, lotteryType: 'Fundraising' };
  }
  lottery = await prisma.lotteryClassic.findFirst({ where: { id, lotteryStatus: 'Open' }, select: { id: true, endDate: true } });
  if (lottery) {
    return { lottery, lotteryType: 'Classic' };
  }
  return { lottery: null, lotteryType: null };
};

// Function to schedule lottery draw
export const scheduleLotteryDraw = ({ id, drawTime, lotteryType }) => {
  const endDate = new Date(drawTime);
  if (isNaN(endDate.getTime())) {
    console.error(`Invalid draw time for lottery ID ${id}. Please check the endDate value:`, drawTime);
    return;
  }

  const localDate = new Date(endDate);
  const minutes = localDate.getMinutes();
  const hours = localDate.getHours();
  const day = localDate.getDate();
  const month = localDate.getMonth() + 1;

  const cronTime = `${minutes} ${hours} ${day} ${month} *`;

  if (scheduledJobs.has(id)) {
    const existingJob = scheduledJobs.get(id);
    existingJob.stop();
    scheduledJobs.delete(id);
  }

  const job = cron.schedule(cronTime, async () => {
    console.log(`Running scheduled lottery draw for Lottery ID: ${id}`);
    let winners;
    if (lotteryType === 'Classic') {
      winners = await performClassicLotteryDraw(id);
    } else {
      winners = await performLotteryDraw(id, lotteryType);
    }
    console.log("wwwwww", winners);
    if (winners && winners.length > 0) {
      winners.forEach((winner) => {
        console.log(`The winner is ${winner.fullName} for lottery ID ${id} in place ${winner.place}`);
      });
    } else {
      console.log(`/schedule/No participants in the lottery ID: ${id}`);
    }

    try {
      await updateLotteryStatusToClosed(id, lotteryType);
      console.log(`Lottery ID ${id} status has been changed to Closed.`);
    } catch (error) {
      console.error(`Failed to update lottery status for ID ${id}:`, error);
    }
  });

  scheduledJobs.set(id, job);

  const formattedDate = localDate.toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  const formattedTime = localDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

  console.log(`Scheduled lottery:
    - ID: ${id}
    - Type: ${lotteryType}
    - Draw Date: ${formattedDate}
    - Draw Time: ${formattedTime}
    - Cron Time: ${cronTime}`);
};

// Function to initialize scheduled draws
export const initializeScheduledDraws = async () => {
  try {
    const lotteries = await prisma.lotteryLike.findMany({
      where: { lotteryStatus: 'Open', endDate: { gt: new Date() } },
      select: { id: true, endDate: true },
    });

    const fundraisingLotteries = await prisma.lotteryFundraising.findMany({
      where: { lotteryStatus: 'Open', endDate: { gt: new Date() } },
      select: { id: true, endDate: true },
    });

    const classicLotteries = await prisma.lotteryClassic.findMany({
      where: { lotteryStatus: 'Open', endDate: { gt: new Date() } },
      select: { id: true, endDate: true },
    });

    const allLotteries = [
      ...lotteries.map((lottery) => ({ ...lottery, type: 'Like' })),
      ...fundraisingLotteries.map((lottery) => ({ ...lottery, type: 'Fundraising' })),
      ...classicLotteries.map((lottery) => ({ ...lottery, type: 'Classic' })),
    ];

    // Get current local time
    const now = new Date();

    // Define the start of "today" in local time
    const localTodayStart = new Date();
    localTodayStart.setHours(0, 0, 0, 0); // Today at 00:00:00 local time

    // Define the end of "today" in local time (23:59:59)
    const localTodayEnd = new Date(localTodayStart);
    localTodayEnd.setHours(23, 59, 59, 999); // Today at 23:59:59 local time

    // Filter lotteries that should run today or just after midnight in local time
    const lotteriesForToday = allLotteries.filter((lottery) => {
      const endDateUTC = new Date(lottery.endDate); // endDate is in UTC

      // Convert the UTC end date to the server's local time
      const localEndDate = new Date(endDateUTC.getTime() - (new Date().getTimezoneOffset() * 60000));

      // Check if the local end date falls within today's local time or just after midnight
      return (
        (localEndDate >= localTodayStart && localEndDate <= localTodayEnd) ||
        (localEndDate > localTodayEnd && localEndDate.getHours() < 6) // Covers times up to 6 AM of the next day
      );
    });

    if (lotteriesForToday.length > 0) {
      for (const lottery of lotteriesForToday) {
        const drawTime = new Date(lottery.endDate).toISOString();
        scheduleLotteryDraw({ id: lottery.id, drawTime, lotteryType: lottery.type });
      }
      console.log(`Scheduled ${lotteriesForToday.length} lotteries to run today.`);
    } else {
      console.log('No lotteries scheduled for today.');
    }
  } catch (error) {
    console.error('Error initializing scheduled draws:', error);
  }
};


// Function to update lottery status to 'Closed'
const updateLotteryStatusToClosed = async (id, lotteryType) => {
  const updateData = { lotteryStatus: 'Closed' };
  if (lotteryType === 'Like') {
    await prisma.lotteryLike.updateMany({ where: { id }, data: updateData });
  } else if (lotteryType === 'Fundraising') {
    await prisma.lotteryFundraising.updateMany({ where: { id }, data: updateData });
  } else if (lotteryType === 'Classic') {
    await prisma.lotteryClassic.updateMany({ where: { id }, data: updateData });
  }
};

const performLotteryDraw = async (lotteryId, lotteryType) => {
  try {
    let lottery;

    if (lotteryType === 'Like') {
      await checkAndCreateUsersForLotteryLike(lotteryId);
      lottery = await prisma.lotteryLike.findUnique({
        where: { id: lotteryId },
        select: { prizes: true },
      });
    } else if (lotteryType === 'Fundraising') {
      lottery = await prisma.lotteryFundraising.findUnique({
        where: { id: lotteryId },
        select: { prizes: true },
      });
    } else if (lotteryType === 'Classic') {
      lottery = await prisma.lotteryClassic.findUnique({
        where: { id: lotteryId },
        select: { prizes: true },
      });
    } else {
      throw new Error(`Unsupported lottery type: ${lotteryType}`);
    }

    if (!lottery || !lottery.prizes) {
      console.log(`No prizes found for lottery ID: ${lotteryId}`);
      return null;
    }

    const prizes = lottery.prizes;
    const participants = await fetchParticipantsFromDatabase(lotteryId);

    if (participants.length === 0) {
      console.log(`No participants found for lottery ID: ${lotteryId}`);
      return null;
    }

    const shuffledParticipants = participants.sort(() => Math.random() - 0.5);
    const winners = [];

    const selectedTicketNumbers = new Set();

    for (let i = 0; i < prizes.length; i++) {
      const availableParticipants = shuffledParticipants.filter(
        participant => !selectedTicketNumbers.has(participant.id)
      );

      if (availableParticipants.length > 0) {
        const winnerIndex = Math.floor(Math.random() * availableParticipants.length);
        const winner = availableParticipants[winnerIndex];

        winners.push({
          id: winner.id,
          name: winner.name,
          email: winner.email,
          fullName: winner.fullName,
          ticketNumber: winner.ticketNumber,
          place: i + 1,
          prize: prizes[i],
        });

        selectedTicketNumbers.add(winner.id);
      } else {
        console.log('Not enough unique tickets for all prizes');
        break;
      }
    }

    console.log(`Winners for lottery ID ${lotteryId}:`, winners);

    const winnersData = winners.map((winner) => ({
      place: winner.place,
      ticketId: winner.ticketNumber,
      fullName: winner.fullName,
      email: winner.email,
    }));

    await updateLotteryWinners(lotteryId, lotteryType, participants.length, winnersData);

    await updateTicketStatuses(lotteryId, winners);

    return winners;
  } catch (error) {
    console.error(`Error performing lottery draw for lottery ID ${lotteryId}:`, error);
    throw error;
  }
};

// Function to fetch participants from the database
const fetchParticipantsFromDatabase = async (lotteryId) => {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { lotteryId, status: 'Active' },
      include: { user: true },
    });
    console.log("tickets fetched for lottery", tickets);
    return tickets.map(ticket => ({
      id: ticket.id,
      ticketNumber: ticket.ticketNumber,
      name: ticket.user.fullName || `${ticket.user.firstName} ${ticket.user.lastName}`,
      fullName: ticket.user.fullName || `${ticket.user.firstName} ${ticket.user.lastName}`,
      email: ticket.user.email,
      numbers: Array.isArray(ticket.numbers) ? ticket.numbers : null, // Ensure 'numbers' is an array or set to null if not present
    }));
  } catch (error) {
    console.error(`Error fetching participants for lottery ID ${lotteryId}:`, error);
    throw error;
  }
};

// Function to update ticket statuses based on draw results
const updateTicketStatuses = async (lotteryId, winners) => {
  try {
    const winningTicketIds = new Set(winners.map(winner => winner.id));

    const allTickets = await prisma.ticket.findMany({
      where: { lotteryId }
    });

    const ticketUpdates = allTickets.map(ticket => {
      if (winningTicketIds.has(ticket.id)) {
        return prisma.ticket.update({
          where: { id: ticket.id },
          data: { status: 'Won' }
        });
      } else {
        return prisma.ticket.update({
          where: { id: ticket.id },
          data: { status: 'Ended' }
        });
      }
    });

    await Promise.all(ticketUpdates);
  } catch (error) {
    console.error(`Error updating ticket statuses for lottery ID ${lotteryId}:`, error);
    throw error;
  }
};

// Function to update winners and participant count
const updateLotteryWinners = async (lotteryId, lotteryType, participantCount, winnersTickets) => {
  let model;
  if (lotteryType === 'Like') {
    model = prisma.lotteryLike;
  } else if (lotteryType === 'Fundraising') {
    model = prisma.lotteryFundraising;
  } else if (lotteryType === 'Classic') {
    model = prisma.lotteryClassic;
  } else {
    throw new Error(`Invalid lottery type: ${lotteryType}`);
  }

  await model.update({
    where: { id: lotteryId },
    data: {
      participantCount,
      winnersTickets
    },
  });
};

// Controller function to fetch all lotteries with draw times
export const fetchAndReturnLotteries = async (req, res) => {
  try {
    const likeLotteries = await prisma.lotteryLike.findMany({ where: { lotteryStatus: 'Open' }, select: { id: true, endDate: true } });
    const fundraisingLotteries = await prisma.lotteryFundraising.findMany({ where: { lotteryStatus: 'Open' }, select: { id: true, endDate: true } });
    const classicLotteries = await prisma.lotteryClassic.findMany({ where: { lotteryStatus: 'Open' }, select: { id: true, endDate: true } });

    const allLotteries = [
      ...likeLotteries.map(lottery => ({ ...lottery, type: 'Like' })),
      ...fundraisingLotteries.map(lottery => ({ ...lottery, type: 'Fundraising' })),
      ...classicLotteries.map(lottery => ({ ...lottery, type: 'Classic' })),
    ];

    res.status(200).json(allLotteries);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch lotteries.', error });
  }
};



// Function to check who liked the link and handle user and ticket creation
const checkAndCreateUsersForLotteryLike = async (lotteryId) => {
  try {
    console.log("here we go:");

    // Simulate fetching users who liked the link
    //const likedUsers = getRandomUsersFromMockData(10); // Get 10 random users from the mock data
    const likedUsers = [{ email: 'sasha25111992@gmail.com', fullName: 'Sasha Example', firstName: 'Sasha', lastName: 'Example' }];

    console.log("Simulated users who liked the link:", likedUsers);
    for (const likedUser of likedUsers) {
      // Step 2: Check if user already exists in the database
      let user = await prisma.user.findUnique({
        where: { email: likedUser.email }, // Assuming users are identified by email
      });
      console.log("setep2end")
      // Step 3: If user doesn't exist, create a new user
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: likedUser.email,
            fullName: likedUser.fullName || `${likedUser.firstName} ${likedUser.lastName}`,
            firstName: likedUser.firstName,
            lastName: likedUser.lastName,
          },
        });

        console.log(`User created: ${user.email}`);
      } else {
        console.log(`User already exists: ${user.email}`);
      }

      // Step 4: Purchase a free ticket for the user
      await prisma.ticket.create({
        data: {
          lotteryType: "Like",
          ticketNumber: generateUniqueTicketNumber(),
          purchaseDate: new Date(),
          status: "Active",
          user: { connect: { email: user.email }, },
          lotteryLike: { connect: { id: lotteryId }, },
        },
      });

      console.log(`Free ticket purchased for user: ${user.email} in lottery: ${lotteryId}`);
    }
  } catch (error) {
    console.error('Error checking and creating users for LotteryLike:', error);
    throw error;
  }
};

// Helper function to generate a unique ticket number
const generateUniqueTicketNumber = () => {
  return Math.random().toString(36).substring(2, 15).toUpperCase();
};

// Helper function to generate random numbers for the ticket
const generateRandomNumbersForTicket = () => {
  return Array.from({ length: 5 }, () => Math.floor(Math.random() * 50) + 1);
};

// Function to get random users from mock data
const getRandomUsersFromMockData = (count) => {
  const shuffled = Users.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
};






export { scheduledJobs };
