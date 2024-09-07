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

    const drawTime = new Date(lottery.endDate).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    scheduleLotteryDraw({ id, drawTime, lotteryType });

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

// Function to schedule a lottery draw
const scheduleLotteryDraw = ({ id, drawTime, lotteryType }) => {
  const cronTime = convertToCronTime(drawTime);

  if (scheduledJobs.has(id)) {
    const existingJob = scheduledJobs.get(id);
    existingJob.stop();
    scheduledJobs.delete(id);
  }

  const job = cron.schedule(cronTime, async () => {
    console.log(`Running scheduled lottery draw for Lottery ID: ${id}`);
    const winners = await performLotteryDraw(id, lotteryType);

    if (winners && winners.length > 0) {
      winners.forEach(winner => {
        console.log(`The winner is ${winner.name} for lottery ID ${id} in place ${winner.place}`);
      });
    } else {
      console.log(`No participants in the lottery ID: ${id}`);
    }

    try {
      await updateLotteryStatusToClosed(id, lotteryType);
      console.log(`Lottery ID ${id} status has been changed to Closed.`);
    } catch (error) {
      console.error(`Failed to update lottery status for ID ${id}:`, error);
    }
  });

  scheduledJobs.set(id, job);
  console.log(`Scheduled lottery ID ${id} to run at ${drawTime}`);
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

    // Fetch the lottery details based on the type
    if (lotteryType === 'Like') {
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
      return null; // No prizes, no draw
    }

    // Extract prizes from the fetched lottery data
    const prizes = lottery.prizes;
    const participants = await fetchParticipantsFromDatabase(lotteryId);

    if (participants.length === 0) {
      console.log(`No participants found for lottery ID: ${lotteryId}`);
      return null; // No participants, no winner
    }

    // Shuffle participants to randomize
    const shuffledParticipants = participants.sort(() => Math.random() - 0.5);
    const winners = [];

    // Track selected ticket numbers to ensure each ticket wins only once
    const selectedTicketNumbers = new Set();

    // Try to assign a prize to each unique ticket
    for (let i = 0; i < prizes.length; i++) {
      const availableParticipants = shuffledParticipants.filter(
        participant => !selectedTicketNumbers.has(participant.id) // Use participant's ticket id instead of user id
      );

      if (availableParticipants.length > 0) {
        // Randomly pick a participant from the available ones
        const winnerIndex = Math.floor(Math.random() * availableParticipants.length);
        const winner = availableParticipants[winnerIndex];

        winners.push({
          id: winner.id,
          name: winner.name,
          email: winner.email,
          fullName: winner.fullName,  // Include full name of the winner
          ticketNumber: winner.ticketNumber,  // Ensure ticketNumber is properly assigned
          place: i + 1,
          prize: prizes[i],
        });

        // Mark this ticket number as having won
        selectedTicketNumbers.add(winner.id);
      } else {
        console.log('Not enough unique tickets for all prizes');
        break;
      }
    }

    console.log(`Winners for lottery ID ${lotteryId}:`, winners);

    const winnersData = winners.map((winner) => ({
      place: winner.place,
      ticketId: winner.ticketNumber,  // Correctly use the ticketNumber
      fullName: winner.fullName,  // Include full name in the winners data
    }));

    await updateLotteryWinners(lotteryId, lotteryType, participants.length, winnersData);

    // Update ticket statuses after determining the winners
    await updateTicketStatuses(lotteryId, winners);

    return winners;
  } catch (error) {
    console.error(`Error performing lottery draw for lottery ID ${lotteryId}:`, error);
    throw error;
  }
};

/// Function to fetch participants from the database based on lottery ID
const fetchParticipantsFromDatabase = async (lotteryId) => {
  try {
    const tickets = await prisma.ticket.findMany({
      where: { lotteryId, status: 'Active' },
      include: { user: true },
    });
    console.log("tickets fetched for lottery", tickets);
    return tickets.map(ticket => ({
      id: ticket.id, // Use ticket ID as the unique identifier
      ticketNumber: ticket.ticketNumber,
      name: ticket.user.fullName || `${ticket.user.firstName} ${ticket.user.lastName}`,
      fullName: ticket.user.fullName || `${ticket.user.firstName} ${ticket.user.lastName}`, // Add full name field
      email: ticket.user.email,
    }));
  } catch (error) {
    console.error(`Error fetching participants for lottery ID ${lotteryId}:`, error);
    throw error;
  }
};



// Function to update ticket statuses based on the draw result
const updateTicketStatuses = async (lotteryId, winners) => {
  try {
    // Extract winning ticket IDs
    const winningTicketIds = new Set(winners.map(winner => winner.id));

    // Fetch all tickets for the lottery
    const allTickets = await prisma.ticket.findMany({
      where: { lotteryId }
    });

    // Prepare ticket updates
    const ticketUpdates = allTickets.map(ticket => {
      if (winningTicketIds.has(ticket.id)) {
        // Ticket won, update status to 'Won'
        return prisma.ticket.update({
          where: { id: ticket.id },
          data: { status: 'Won' }
        });
      } else {
        // Ticket did not win, update status to 'Ended'
        return prisma.ticket.update({
          where: { id: ticket.id },
          data: { status: 'Ended' }
        });
      }
    });

    // Execute all updates
    await Promise.all(ticketUpdates);
  } catch (error) {
    console.error(`Error updating ticket statuses for lottery ID ${lotteryId}:`, error);
    throw error;
  }
};

// Function to update winners and participant count
const updateLotteryWinners = async (lotteryId, lotteryType, participantCount, winnersTickets) => {
  // Determine the correct model based on lottery type
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

  // Perform the update using the correct model
  await model.update({
    where: { id: lotteryId },
    data: { 
      participantCount, 
      winnersTickets 
    },
  });
};

// Controller function to fetch all lotteries with draw times and return them in the response
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
