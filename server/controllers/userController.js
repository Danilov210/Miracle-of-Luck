import asyncHandler from "express-async-handler";
import { prisma } from "../config/prismaConfig.js";


//++ Function to register a new user or return existing user details.
export const createUser = asyncHandler(async (req, res) => {
  // Extract user details from the request body, defaulting to an empty object if not provided
  const { email, firstName, lastName, picture } = req.body.data || {};

  // Validate that the email is provided
  if (!email) {
    return res.status(400).send({ message: "Email is required" }); // Send a 400 Bad Request if email is missing
  }

  try {
    // Normalize email to lowercase and remove extra whitespace
    const normalizedEmail = email.trim().toLowerCase();

    // Check if a user with the provided email already exists in the database
    const userExists = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (!userExists) {
      console.log("User does not exist. Registering new user.");

      // Create a new user in the database with the provided details
      const user = await prisma.user.create({
        data: {
          email: normalizedEmail, // Store the normalized email
          firstName,
          lastName,
          picture,
        },
      });

      // Return success response with the newly created user details
      return res.status(201).send({
        message: "User registered successfully",
        user: user,
      });

    } else {
      console.log("User already exists. Returning existing user details.");

      // Return a response indicating the user already exists and provide the user details
      return res.status(200).send({ // Changed status to 200 OK since it's not a new creation
        message: "User already registered",
        user: userExists // Include the existing user details in the response
      });
    }
  } catch (err) {
    // Log the error for debugging purposes
    console.error("Error creating user:", err.message);

    // Return a 500 Internal Server Error response with the error message
    return res.status(500).send({ message: "An error occurred while creating the user." });
  }
});

//++ Function to handle Fundraising ticket purchase for fundraising
export const buyTicketFundraising = asyncHandler(async (req, res) => {
  const { ticketNumber, lotteryId, email, totalPrice } = req.body.data;

  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user's balance is sufficient
    if (user.balance < totalPrice) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Find the lottery by ID
    const lottery = await prisma.lotteryFundraising.findUnique({
      where: { id: lotteryId },
    });

    if (!lottery) {
      return res.status(404).json({ message: "Lottery not found" });
    }

    // Create the tickets and associate them with the lottery and user
    const tickets = [];
    for (let i = 0; i < ticketNumber; i++) {
      const ticket = await prisma.ticket.create({
        data: {
          lotteryType: "Fundraising",
          ticketNumber: `${lotteryId}-${Date.now()}-${i}`, // Unique ticket number
          purchaseDate: new Date(),
          status: "Active",
          user: {
            connect: { id: user.id }, // Associate the ticket with the user
          },
          lotteryFundraising: {
            connect: { id: lotteryId }, // Associate the ticket with the specific lottery
          },
        },
      });

      tickets.push(ticket);
    }

    // Deduct the total ticket price from the user's balance
    await prisma.user.update({
      where: { email },
      data: {
        balance: { decrement: totalPrice },
      },
    });

    // Return success response
    console.log("Ticket(s) purchased successfully.");
    return res.status(201).json({
      message: "Ticket(s) purchased successfully.",
      tickets,
    });
  } catch (err) {
    // Log the error message for debugging
    console.error("Error purchasing ticket:", err.message);

    // Send a 500 Internal Server Error response with the error message
    res.status(500).send({ message: "Error processing ticket purchase. Please try again." });
  }
});

//++ Function to handle Classic ticket purchase for fundraising
export const buyTicketClassic = asyncHandler(async (req, res) => {
  const { lotteryId, email, totalPrice, selectedNumbers } = req.body.data; // No need for ticketNumber since it's one ticket per purchase
  console.log(req.body.data);
  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the user's balance is sufficient
    if (user.balance < totalPrice) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Find the classic lottery by ID
    const lottery = await prisma.lotteryClassic.findUnique({
      where: { id: lotteryId },
    });

    if (!lottery) {
      return res.status(404).json({ message: "Lottery not found" });
    }

    // Create the ticket and associate it with the lottery and user
    const ticket = await prisma.ticket.create({
      data: {
        lotteryType: "Classic",
        ticketNumber: `${lotteryId}-${Date.now()}`, // Unique ticket number
        purchaseDate: new Date(),
        status: "Active",
        numbers:selectedNumbers, // Store the user-chosen numbers in the ticket
        user: {
          connect: { id: user.id }, // Associate the ticket with the user
        },
        lotteryClassic: {
          connect: { id: lotteryId }, // Associate the ticket with the specific classic lottery
        },
      },
    });

    // Deduct the total ticket price from the user's balance
    await prisma.user.update({
      where: { email },
      data: {
        balance: { decrement: totalPrice },
      },
    });

    // Return success response
    console.log("Ticket purchased successfully.");
    return res.status(201).json({
      message: "Ticket purchased successfully.",
      ticket,
    });
  } catch (err) {
    // Log the error message for debugging
    console.error("Error purchasing ticket:", err.message);

    // Send a 500 Internal Server Error response with the error message
    res.status(500).send({ message: "Error processing ticket purchase. Please try again." });
  }
});

//++ Function to get all lotteries owned by a user
export const getUserOwnedLottories = asyncHandler(async (req, res) => {
  const { email } = req.body.data; // Correctly extract the email from req.body.data


  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        ownedLotteriesLike: true,       // Include all "Like" lotteries owned by the user
        ownedLotteriesFundraising: true, // Include all "Fundraising" lotteries owned by the user
        ownedLotteriesClassic: true,     // Include all "Classic" lotteries owned by the user
      },
    });

    // Check if user exists
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }

    // Send the user data with owned lotteries
    res.send(user);
  } catch (err) {
    console.error("Error fetching user with lotteries:", err.message);
    res.status(500).send({ message: "Failed to fetch user details. Please try again." });
  }
});

//++ Function to get all tickets owned by a user
export const getUserOwnedTickets = asyncHandler(async (req, res) => {
  const { email } = req.body.data; // Correctly extract the email from req.body.data
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        tickets: {
          include: {
            lotteryClassic: true,
            lotteryLike: true,
            lotteryFundraising: true,
          },
        }, // Include all ticket relations
      },
    });

    // Check if user exists
    if (!user) {
      return res.status(404).send({ message: "User not found." });
    }
    console.log("Send User Ticket", email)
    // Send the user tickets data
    res.send(user.tickets);
  } catch (err) {
    console.error("Error fetching user tickets:", err.message);
    res.status(500).send({ message: "Failed to fetch user tickets. Please try again." });
  }
});

// Function to cancel a ticket by a user
export const cancelTicket = asyncHandler(async (req, res) => {
  try {

    const { ticketId } = req.body.data;

    console.log("Received ticketId:", ticketId);

    // Validate that ticketId is provided
    if (!ticketId) {
      return res.status(400).json({ error: "Ticket ID is required" });
    }

    // Find the ticket by ID
    const ticket = await prisma.ticket.findUnique({
      where: { id: ticketId },
    });

    if (!ticket) {
      return res.status(404).json({ error: "Ticket not found" });
    }

    // Check if the ticket is already canceled
    if (ticket.status === "Canceled") {
      return res.status(400).json({ error: "Ticket is already canceled" });
    }

    // Find the associated lottery to get the ticket price
    const lottery =
      ticket.lotteryType === "Like"
        ? await prisma.lotteryLike.findUnique({ where: { id: ticket.lotteryId } })
        : ticket.lotteryType === "Fundraising"
          ? await prisma.lotteryFundraising.findUnique({ where: { id: ticket.lotteryId } })
          : await prisma.lotteryClassic.findUnique({ where: { id: ticket.lotteryId } });

    if (!lottery) {
      return res.status(404).json({ error: "Associated lottery not found" });
    }

    // Calculate the refund amount (assuming the price is in the lottery model)
    const refundAmount = lottery.price;

    // Update the user's balance and delete the ticket in a single transaction
    await prisma.$transaction([
      prisma.ticket.delete({
        where: { id: ticketId },
      }),
      prisma.user.update({
        where: { id: ticket.userId },
        data: {
          balance: { increment: refundAmount },
        },
      }),
    ]);
    console.log("Ticket canceled and deleted successfully:", ticketId);

    return res.status(201).json({
      message: "Ticket canceled and deleted successfully"
    });
  } catch (error) {
    console.error("Error canceling ticket:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});
