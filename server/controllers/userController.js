import asyncHandler from "express-async-handler";
import { prisma } from "../config/prismaConfig.js";
import { scheduledJobs } from './drawController.js';

// Function to register a new user or return existing user details.
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
    const userExists = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!userExists) {
      console.log("User does not exist. Registering new user.");

      // Create a fullName by combining firstName and lastName
      const fullName = `${firstName || ""} ${lastName || ""}`.trim();

      // Create a new user in the database with the provided details
      const user = await prisma.user.create({
        data: {
          email: normalizedEmail, // Store the normalized email
          firstName,
          lastName,
          picture,
          fullName, // Include the fullName field
        },
      });

      // Return success response with the newly created user details, excluding sensitive fields
      return res.status(201).send({
        message: "User registered successfully",
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          email: user.email,
          picture: user.picture,
          balance: user.balance,
          accountStatus: user.accountStatus,
          DataOfBirth: user.DataOfBirth ? new Date(user.DataOfBirth).toLocaleDateString("he-IL") : null, // Format safely for Israel
          tickets: user.tickets,
          ownedLotteriesLike: user.ownedLotteriesLike,
          ownedLotteriesFundraising: user.ownedLotteriesFundraising,
          ownedLotteriesClassic: user.ownedLotteriesClassic,
          transactionHistory: user.transactionHistory,
        },
      });
    } else {
      console.log("User already exists. Returning existing user details.");

      // Manually construct user object to exclude password and other sensitive fields
      const sanitizedUser = {
        firstName: userExists.firstName,
        lastName: userExists.lastName,
        fullName: userExists.fullName,
        email: userExists.email,
        picture: userExists.picture,
        balance: userExists.balance,
        accountStatus: userExists.accountStatus,
        DataOfBirth: userExists.DataOfBirth ? new Date(userExists.DataOfBirth).toLocaleDateString("en-GB") : null, // Correct variable usage
        tickets: userExists.tickets,
        ownedLotteriesLike: userExists.ownedLotteriesLike,
        ownedLotteriesFundraising: userExists.ownedLotteriesFundraising,
        ownedLotteriesClassic: userExists.ownedLotteriesClassic,
        transactionHistory: userExists.transactionHistory,
      };

      // Return a response indicating the user already exists
      return res.status(200).send({
        message: "User already registered",
        user: sanitizedUser, // Return sanitized user details
      });
    }
  } catch (err) {
    // Log the error for debugging purposes
    console.error("Error creating user:", err.message);

    // Return a 500 Internal Server Error response with the error message
    return res.status(500).send({ message: "An error occurred while creating the user." });
  }
});



export const buyTicketFundraising = asyncHandler(async (req, res) => {
  const { ticketNumber, lotteryId, email } = req.body.data;

  try {
    console.log('Request received:', req.body.data);

    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error("User not found:", email);
      return res.status(404).json({ message: "User not found" });
    }

    // Find the lottery by ID
    const lottery = await prisma.lotteryFundraising.findUnique({
      where: { id: lotteryId },
      select: { price: true }
    });

    if (!lottery) {
      console.error("Lottery not found:", lotteryId);
      return res.status(404).json({ message: "Lottery not found" });
    }

    // Calculate the total price based on ticket number and lottery price
    const totalPrice = lottery.price * ticketNumber;
    console.log('Calculated total price:', totalPrice);

    // Check if the user's balance is sufficient
    if (user.balance < totalPrice) {
      console.error("Insufficient balance:", user.balance);
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // Prepare the operations to be executed in a transaction
    const createTicketsOperations = Array.from({ length: ticketNumber }).map((_, i) => {
      return prisma.ticket.create({
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
    });

    // Update user balance operation
    const updateUserBalanceOperation = prisma.user.update({
      where: { email },
      data: {
        balance: { decrement: totalPrice },
      },
    });

    // Create transaction entry operation
    const createTransactionOperation = prisma.transaction.create({
      data: {
        amount: totalPrice,
        transactionType: "PurchaseTicket",
        user: {
          connect: { id: user.id },
        },
        createdAt: new Date(),
      },
    });

    // Combine all operations into a single transaction
    const result = await prisma.$transaction([
      ...createTicketsOperations,
      updateUserBalanceOperation,
      createTransactionOperation
    ]);

    console.log("Ticket(s) purchased and transaction created successfully.");
    return res.status(201).json({
      message: "Ticket(s) purchased successfully.",
      tickets: result.slice(0, ticketNumber), // Extract only ticket creation results
    });
  } catch (err) {
    console.error("Error purchasing ticket:", err.message);
    res.status(500).send({ message: "Error processing ticket purchase. Please try again." });
  }
});







//++ Function to handle Classic ticket purchase for fundraising
export const buyTicketClassic = asyncHandler(async (req, res) => {
  const { lotteryId, email, totalPrice, selectedNumbers } = req.body.data;
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

    // Use a transaction to ensure all operations are completed atomically
    const result = await prisma.$transaction(async (prisma) => {
      // Create the ticket and associate it with the lottery and user
      const ticket = await prisma.ticket.create({
        data: {
          lotteryType: "Classic",
          ticketNumber: `${lotteryId}-${Date.now()}`, // Unique ticket number
          purchaseDate: new Date(),
          status: "Active",
          numbers: selectedNumbers, // Store the user-chosen numbers in the ticket
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

      // Create a transaction entry for the ticket purchase
      const transaction = await prisma.transaction.create({
        data: {
          amount: totalPrice,
          transactionType: "PurchaseTicket",
          user: {
            connect: { id: user.id },
          },
          createdAt: new Date(), // Include current timestamp
        },
      });

      return { ticket, transaction };
    });

    // Return success response
    console.log("Ticket purchased and transaction created successfully.");
    return res.status(201).json({
      message: "Ticket purchased successfully.",
      ticket: result.ticket,
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

//++ Function to cancel a ticket by a user
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

    // Perform the transaction to delete the ticket, update the user's balance, and create a transaction entry
    const updatedUser = await prisma.$transaction(async (tx) => {
      // Delete the ticket
      await tx.ticket.delete({
        where: { id: ticketId },
      });

      // Update user's balance
      const user = await tx.user.update({
        where: { id: ticket.userId },
        data: {
          balance: { increment: refundAmount },
        },
      });

      // Create a transaction entry for the ticket cancellation
      await tx.transaction.create({
        data: {
          amount: refundAmount,
          transactionType: "CancelTicket",
          user: { connect: { id: ticket.userId } },
          createdAt: new Date(), // Include the current timestamp
        },
      });

      return user; // Return the updated user data
    });

    console.log("Ticket canceled successfully:", ticketId);

    return res.status(201).json({
      message: "Ticket canceled successfully",
      balance: updatedUser.balance, // Include the updated balance in the response
    });
  } catch (error) {
    console.error("Error canceling ticket:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});



// Function to delete a lottery by a user
export const cancelLottery = asyncHandler(async (req, res) => {
  try {
    const { email, lotteryId, lotteryType } = req.body.data;

    if (!lotteryId || !lotteryType) {
      return res.status(400).json({ error: "Lottery ID and Type are required" });
    }

    // Determine the lottery type and fetch the associated lottery details
    const lottery = await prisma[
      lotteryType === "Like"
        ? "lotteryLike"
        : lotteryType === "Fundraising"
        ? "lotteryFundraising"
        : "lotteryClassic"
    ].findUnique({ where: { id: lotteryId } });

    if (!lottery) {
      return res.status(404).json({ error: "Lottery not found" });
    }

    // Check if the lottery is scheduled and remove it from the scheduler
    if (scheduledJobs.has(lotteryId)) {
      const scheduledJob = scheduledJobs.get(lotteryId);
      scheduledJob.stop(); // Stop the scheduled job
      scheduledJobs.delete(lotteryId); // Remove the job from the scheduler map
      console.log(`Removed scheduled job for lottery ID: ${lotteryId}`);
    }

    const refundAmountPerTicket = lottery.price || 0;

    // Fetch all tickets associated with the lottery
    const tickets = await prisma.ticket.findMany({ where: { lotteryId } });

    // Calculate total refunds for each user
    const userRefunds = tickets.reduce((acc, { userId }) => {
      acc[userId] = (acc[userId] || 0) + refundAmountPerTicket;
      return acc;
    }, {});

    // Perform the deletion, refund, and transaction creation in a transaction
    await prisma.$transaction([
      // Refund users and create a single "Cancel Ticket" transaction per user
      ...Object.entries(userRefunds)
        .map(([userId, refundAmount]) => [
          prisma.user.update({
            where: { id: userId },
            data: { balance: { increment: refundAmount } },
          }),
          prisma.transaction.create({
            data: {
              amount: refundAmount,
              transactionType: "CancelTicket",
              user: { connect: { id: userId } },
              createdAt: new Date(),
            },
          }),
        ])
        .flat(),
      // Delete associated tickets
      prisma.ticket.deleteMany({ where: { lotteryId } }),
      // Delete the lottery
      prisma[
        lotteryType === "Like"
          ? "lotteryLike"
          : lotteryType === "Fundraising"
          ? "lotteryFundraising"
          : "lotteryClassic"
      ].delete({
        where: { id: lotteryId },
      }),
    ]);

    // Fetch the updated balance for the user who canceled the lottery
    const updatedUser = await prisma.user.findUnique({
      where: { email },
      select: { balance: true },
    });

    res.status(200).json({
      message: "Lottery deleted successfully.",
      balance: updatedUser.balance,
    });
  } catch (error) {
    console.error("Error deleting lottery:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});






//++ Function update user details
export const updateUserProfile = asyncHandler(async (req, res) => {
  try {
    console.log(req.body.data)
    const { email, firstName, lastName, DataOfBirth, picture } = req.body.data;
    if (!email) return res.status(400).json({ error: "User email is required." });

    const updateData = {
      firstName,
      lastName,
      DataOfBirth: DataOfBirth ? new Date(DataOfBirth) : undefined,
      picture
    };

    // Fetch current user if fullName needs updating
    if (firstName || lastName) {
      const currentUser = await prisma.user.findUnique({ where: { email } });
      if (!currentUser) return res.status(404).json({ error: "User not found." });
      updateData.fullName = `${firstName || currentUser.firstName || ''} ${lastName || currentUser.lastName || ''}`.trim();
    }

    // Update user and format response
    const { accountStatus: __, ...updatedUser } = await prisma.user.update({
      where: { email },
      data: updateData,
    });

    res.status(200).send({
      message: "User profile updated successfully",
      user: {
        ...updatedUser,
        DataOfBirth: updatedUser.DataOfBirth ? new Date(updatedUser.DataOfBirth).toLocaleDateString("en-GB") : null,
      }
    });

  } catch (error) {
    console.error("Error updating user profile:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

//+++ Function creating a new transaction
export const createTransaction = asyncHandler(async (req, res) => {
  const { email, cardNumber, amount, type } = req.body.data;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "User not found" });

    const transactionResult = await prisma.$transaction(async (prisma) => {
      const transaction = await prisma.transaction.create({
        data: { amount, transactionType: type, creditCard: cardNumber, user: { connect: { id: user.id } } },
      });

      if (type === "Deposit") await prisma.user.update({ where: { email }, data: { balance: { increment: amount } } });
      if (type === "Withdraw") {
        if (user.balance < amount) throw new Error("Insufficient balance");
        await prisma.user.update({ where: { email }, data: { balance: { decrement: amount } } });
      }

      return transaction;
    });

    const updatedUser = await prisma.user.findUnique({ where: { email } });
    if (!updatedUser) return res.status(404).json({ message: "User not found after transaction." });

    const { firstName, lastName, fullName, DataOfBirth, picture, balance } = updatedUser;
    res.status(201).json({
      message: "Transaction processed successfully.",
      user: { email, firstName, lastName, fullName, DataOfBirth: DataOfBirth ? new Date(DataOfBirth).toLocaleDateString("en-GB") : null, picture, balance }
    });
  } catch (error) {
    res.status(error.message === "Insufficient balance" ? 400 : 500).json({ message: error.message || "Internal server error" });
  }
});

// Function to retrieve all transactions for a specific user
export const getUserTransactions = asyncHandler(async (req, res) => {
  const { email } = req.body.data; // Extract email from the request body

  try {
    // Find the user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch all transactions associated with the user's ID
    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }, // Optional: order by creation date
    });

    return res.status(200).json({
      message: "Transactions retrieved successfully.",
      transactions,
    });
  } catch (error) {
    console.error("Error fetching transactions:", error.message);
    res.status(500).json({ error: "Internal server error" });
  }
});

