import asyncHandler from "express-async-handler";
import { prisma } from "../config/prismaConfig.js";
import { scheduledJobs } from './drawController.js';

//++ Function to register a new user or return existing user details
export const createUser = asyncHandler(async (req, res) => {
  const { email, firstName, lastName, picture } = req.body.data || {};

  // Validate that the email is provided
  if (!email) {
    return res.status(400).send({ message: "Email is required" });
  }

  try {
    const normalizedEmail = email.trim().toLowerCase();// Normalize email
    const userExists = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    // If user exists, return user details
    if (!userExists) {

      // Create a fullName by combining firstName and lastName
      const fullName = `${firstName || ""} ${lastName || ""}`.trim();

      // Create a new user 
      const user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          firstName,
          lastName,
          picture,
          fullName,
        },
      });

      // Return success response with the newly created user details
      return res.status(201).send({
        message: "User registered successfully",
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          fullName: user.fullName,
          email: user.email,
          picture: user.picture,
          balance: user.balance,
          DataOfBirth: user.DataOfBirth ? new Date(user.DataOfBirth).toLocaleDateString("en-GB") : null,
        },
      });
    } else {
      // Return a response indicating the user already exists with user details
      return res.status(200).send({
        message: "User already registered",
        user: {
          firstName: userExists.firstName,
          lastName: userExists.lastName,
          fullName: userExists.fullName,
          email: userExists.email,
          picture: userExists.picture,
          balance: userExists.balance,
          DataOfBirth: userExists.DataOfBirth ? new Date(userExists.DataOfBirth).toLocaleDateString("en-GB") : null,
        },
      });
    }
  } catch (err) {
    // Handle server error
    return res.status(500).send({ message: "An error occurred while creating the user." });
  }
});

//++ Function to purchase of tickets for a fundraising lottery
export const buyTicketFundraising = asyncHandler(async (req, res) => {
  const { ticketNumber, lotteryId, email } = req.body.data;

  try {
    // Fetch the user by email
    const user = await prisma.user.findUnique({ where: { email }, });

    // Return if user not found
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Fetch the lottery by ID and status
    const lottery = await prisma.lotteryFundraising.findUnique({
      where: { id: lotteryId },
      select: { price: true, lotteryStatus: true, }
    });

    // Return appropriate message if lottery not found or not open
    if (!lottery || lottery.lotteryStatus !== "Open") {
      const statusMessage = !lottery ? "Lottery not found" : "Lottery is expired";
      return res.status(404).send({ message: statusMessage });
    }

    // Calculate the total price of the tickets
    const totalPrice = lottery.price * ticketNumber;

    // Check if the user's balance is sufficient
    if (user.balance < totalPrice) {
      return res.status(400).send({ message: "Insufficient balance" });
    }

    // Prepare ticket creation operations in a transaction
    const createTicketsOperations = Array.from({ length: ticketNumber }).map((_, i) => {
      return prisma.ticket.create({
        data: {
          lotteryType: "Fundraising",
          ticketNumber: `${lotteryId}-${Date.now()}-${i}`,
          purchaseDate: new Date(),
          status: "Active",
          user: { connect: { email: user.email }, },
          lotteryFundraising: { connect: { id: lotteryId }, },
        },
      });
    });

    // Prepare user balance update and transaction creation
    const updateUserBalanceOperation = prisma.user.update({
      where: { email },
      data: { balance: { decrement: totalPrice }, },
    });

    const createTransactionOperation = prisma.transaction.create({
      data: {
        amount: totalPrice,
        transactionType: "PurchaseTicket",
        user: { connect: { id: user.id }, },
        createdAt: new Date(),
      },
    });

    // Execute all operations within a single transaction
    const result = await prisma.$transaction([
      ...createTicketsOperations,
      updateUserBalanceOperation,
      createTransactionOperation
    ]);

    // Return success response
    return res.status(201).send({ message: "Ticket(s) purchased successfully.", });

  } catch (err) {
    // Handle errors
    return res.status(500).send({ message: "Error processing ticket purchase. Please try again." });
  }
});

//++ Function to handle Classic ticket purchase
export const buyTicketClassic = asyncHandler(async (req, res) => {
  const { lotteryId, email, selectedNumbers } = req.body.data;

  try {
    // Fetch user and validate existence
    const user = await prisma.user.findUnique({ where: { email }, });
    if (!user) return res.status(404).send({ message: "User not found" });


    // Fetch lottery details and validate status
    const lottery = await prisma.lotteryClassic.findUnique({
      where: { id: lotteryId },
      select: { price: true, lotteryStatus: true, }
    });

    // Return appropriate message if lottery not found or not open
    if (!lottery || lottery.lotteryStatus !== "Open") {
      const statusMessage = !lottery ? "Lottery not found" : "Lottery is expired";
      return res.status(404).send({ message: statusMessage });
    }

    // Check if the user's balance is sufficient
    if (user.balance < lottery.price) return res.status(400).send({ message: "Insufficient balance" });



    // Perform atomic operations in a transaction
    const result = await prisma.$transaction(async (prisma) => {
      // Create ticket, deduct balance, and log transaction
      const ticket = await prisma.ticket.create({
        data: {
          lotteryType: "Classic",
          ticketNumber: `${lotteryId}-${Date.now()}`,
          purchaseDate: new Date(),
          status: "Active",
          numbers: selectedNumbers, // Store the user-chosen numbers in the ticket
          user: { connect: { email: user.email }, },
          lotteryClassic: { connect: { id: lotteryId }, },
        },
      });

      await prisma.user.update({
        where: { email },
        data: { balance: { decrement: lottery.price }, },
      });

      await prisma.transaction.create({
        data: {
          amount: lottery.price,
          transactionType: "PurchaseTicket",
          user: { connect: { id: user.id }, },
          createdAt: new Date(),
        },
      });
    });

    return res.status(201).send({ message: "Ticket purchased successfully.", });
  } catch (err) {
    return res.status(500).send({ message: "Error processing ticket purchase. Please try again." });
  }
});

//++ Function to get all lotteries owned by a user
export const getUserOwnedLottories = asyncHandler(async (req, res) => {
  const { email } = req.body.data; // Extract email from request

  try {
    // Fetch user and their owned lotteries from the database
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        ownedLotteriesLike: true,       // "Like" lotteries owned by the user
        ownedLotteriesFundraising: true, // "Fundraising" lotteries owned by the user
        ownedLotteriesClassic: true,     // "Classic" lotteries owned by the user
      },
    });

    // If the user does not exist, return a 404 error
    if (!user) return res.status(404).send({ message: "User not found." });

    return res.send({ message: "User-owned lotteries fetched successfully.", user });
  } catch (err) {
    return res.status(500).send({ message: "Failed to fetch user details. Please try again." });
  }
});

//++ Function to fetch all tickets owned by a user
export const getUserOwnedTickets = asyncHandler(async (req, res) => {
  const { email } = req.body.data; // Extract email from the request

  try {
    // Fetch user tickets with related lottery details
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        tickets: {
          include: {
            lotteryClassic: true, // Include classic lottery details
            lotteryLike: true, // Include like lottery details
            lotteryFundraising: true, // Include fundraising lottery details
          },
        },
      },
    });

    // Return 404 if user not found
    if (!user) return res.status(404).send({ message: "User not found." });

    return res.send({ message: "User-owned tickets fetched successfully.", tickets: user.tickets });
  } catch (err) {
    return res.status(500).send({ message: "Failed to fetch user tickets. Please try again." });
  }
});

export const cancelTicket = asyncHandler(async (req, res) => {
  try {
    const { email,ticketId } = req.body.data; // Extract ticket ID from request

    // Validate ticket ID
    if (!ticketId) return res.status(400).send({ error: "Ticket ID is required" });

    // Find the ticket
    const ticket = await prisma.ticket.findUnique({ where: { id: ticketId } });
    if (!ticket) return res.status(404).send({ error: "Ticket not found" });

    // Check if the ticket is not active
    if (ticket.status !== "Active") return res.status(400).send({ error: "This ticket is no longer active." });


    // Find associated lottery and get the ticket price
    const lottery =
      ticket.lotteryType === "Fundraising"
        ? await prisma.lotteryFundraising.findUnique({ where: { id: ticket.lotteryId }, select: { price: true } })
        : await prisma.lotteryClassic.findUnique({ where: { id: ticket.lotteryId }, select: { price: true } });

    if (!lottery) return res.status(404).send({ error: "Associated lottery not found" });

    const refundAmount = lottery.price; // Calculate refund amount

    // Perform a transaction to delete the ticket, update balance, and create a transaction entry
    const updatedUser = await prisma.$transaction(async (prisma) => {
      // Delete ticket
      await prisma.ticket.delete({ where: { id: ticketId } });

      // Update user balance
      const user = await prisma.user.update({
        where: { email },
        data: { balance: { increment: refundAmount } },
      });

      // Log transaction
      await prisma.transaction.create({
        data: {
          amount: refundAmount,
          transactionType: "CancelTicket",
          user: { connect: { email } },
          createdAt: new Date(),
        },
      });

      return user;
    });

    return res.status(200).send({ message: "Ticket canceled successfully", balance: updatedUser.balance });
  } catch (error) {
    console.error("Error during ticket cancellation:", error); // Log the error for debugging
    return res.status(500).send({ error: "Internal server error" });
  }
});




//++ Function to delete a lottery
export const cancelLottery = asyncHandler(async (req, res) => {
  try {
    const { email, lotteryId, lotteryType } = req.body.data;

    // Validate required input
    if (!lotteryId || !lotteryType) {
      return res.status(400).send({ error: "Lottery ID and Type are required" });
    }

    // Fetch the lottery details based on its type and ensure it is "Open"
    const lottery = await prisma[
      lotteryType === "Fundraising" ? "lotteryFundraising" : "lotteryClassic"
    ].findUnique({
      where: { id: lotteryId },
      select: { price: true, lotteryStatus: true }, // Include status for checking
    });


    if (!lottery) {
      return res.status(404).send({ error: "Lottery not found" });
    }

    // Check if the lottery is in "Open" status
    if (lottery.lotteryStatus !== "Open") {
      return res.status(400).send({ error: "Lottery must be 'Open' to cancel." });
    }


    // Stop and remove any scheduled jobs for this lottery
    if (scheduledJobs.has(lotteryId)) {
      scheduledJobs.get(lotteryId).stop();
      scheduledJobs.delete(lotteryId);
    }

    // Calculate refund per ticket and group refunds by user
    const tickets = await prisma.ticket.findMany({ where: { lotteryId } });


    const userRefunds = tickets.reduce((acc, { userEmail }) => {
      acc[userEmail] = (acc[userEmail] || 0) + lottery.price;
      return acc;
    }, {});


    // Perform the deletion, refunds, and transaction creation within a transaction
    await prisma.$transaction([
      // Refund users and log transactions
      ...Object.entries(userRefunds).flatMap(([userEmail, refundAmount]) => [
        prisma.user.update({
          where: { email: userEmail },
          data: { balance: { increment: refundAmount } }, // Ensure 'balance' is a field of type Decimal or Int in your schema
        }),
        prisma.transaction.create({
          data: {
            amount: refundAmount,
            transactionType: "CancelTicket",
            user: { connect: { email: userEmail } },
            createdAt: new Date(),
          },
        }),
      ]),
      // Delete associated tickets
      prisma.ticket.deleteMany({ where: { lotteryId } }),
      // Delete the lottery
      prisma[lotteryType === "Fundraising" ? "lotteryFundraising" : "lotteryClassic"].delete({
        where: { id: lotteryId },
      }),
    ]);


    // Fetch the updated balance for the user who canceled the lottery
    const user = await prisma.user.findUnique({
      where: { email },
      select: { balance: true },
    });

    if (!user) {
      return res.status(404).send({ error: "User not found" });
    }


    return res.status(200).send({ message: "Lottery deleted successfully.", balance: user.balance });
  } catch (error) {
    console.error("Error during lottery cancellation:", error.message);
    return res.status(500).send({ error: "Internal server error" });
  }
});



//++ Function to update user details
export const updateUserProfile = asyncHandler(async (req, res) => {
  try {
    const { email, firstName, lastName, DataOfBirth, picture } = req.body.data;

    // Validate email
    if (!email) return res.status(400).send({ error: "User email is required." });

    // Prepare the data for updating the user
    const updateData = {
      firstName,
      lastName,
      DataOfBirth: DataOfBirth ? new Date(DataOfBirth) : undefined,
      picture
    };

    // Fetch the current user if name fields are provided
    if (firstName || lastName) {
      const currentUser = await prisma.user.findUnique({ where: { email } });
      if (!currentUser) return res.status(404).send({ error: "User not found." });

      // Update full name if firstName or lastName is provided
      updateData.fullName = `${firstName || currentUser.firstName || ''} ${lastName || currentUser.lastName || ''}`.trim();
    }

    // Update the user and format the response
    const { accountStatus: __, ...updatedUser } = await prisma.user.update({
      where: { email },
      data: updateData,
    });

    // Send success response with updated user data
    return res.status(200).send({
      message: "User profile updated successfully",
      user: {
        ...updatedUser,
        DataOfBirth: updatedUser.DataOfBirth ? new Date(updatedUser.DataOfBirth).toLocaleDateString("en-GB") : null,
      }
    });

  } catch (error) {
    // Handle server errors
    return res.status(500).send({ error: "Internal server error" });
  }
});

//++ Function to create a new transaction
export const createTransaction = asyncHandler(async (req, res) => {
  const { email, cardNumber, amount, type } = req.body.data;

  try {
    // Fetch user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).send({ message: "User not found" });

    // Execute the transaction
    const transactionResult = await prisma.$transaction(async (prisma) => {
      // Create the transaction record
      const transaction = await prisma.transaction.create({
        data: {
          amount,
          transactionType: type,
          creditCard: cardNumber,
          user: { connect: { id: user.id } },
        },
      });

      // Update user's balance based on the transaction type
      if (type === "Deposit") {
        await prisma.user.update({ where: { email }, data: { balance: { increment: amount } } });
      } else if (type === "Withdraw") {
        if (user.balance < amount) throw new Error("Insufficient balance");
        await prisma.user.update({ where: { email }, data: { balance: { decrement: amount } } });
      }

      return transaction;
    });

    // Fetch updated user details
    const updatedUser = await prisma.user.findUnique({ where: { email } });

    const { firstName, lastName, fullName, DataOfBirth, picture, balance } = updatedUser;
    return res.status(201).send({
      message: "Transaction processed successfully.",
      user: {
        firstName,
        lastName,
        fullName,
        DataOfBirth: DataOfBirth ? new Date(DataOfBirth).toLocaleDateString("en-GB") : null,
        picture,
        balance,
      },
    });
  } catch (error) {
    return res.status(error.message === "Insufficient balance" ? 400 : 500).send({ message: error.message || "Internal server error" });
  }
});

//++ Function to retrieve all transactions for a specific user
export const getUserTransactions = asyncHandler(async (req, res) => {
  const { email } = req.body.data; // Extract email from the request body

  try {
    // Fetch the user and their transactions by email
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true }, // Only fetch the user's ID
    });

    if (!user) return res.status(404).send({ message: "User not found" });

    // Retrieve all transactions associated with the user's ID
    const transactions = await prisma.transaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' }, // Order by creation date
    });

    return res.status(200).send({ message: "Transactions retrieved successfully.", transactions });
  } catch (error) {
    return res.status(500).send({ error: "Internal server error" });
  }
});

//++ Function to delete a "Like" lottery
export const cancelLikeLottery = asyncHandler(async (req, res) => {
  try {
    const { lotteryId } = req.body.data;

    // Validate required input
    if (!lotteryId) {
      return res.status(400).send({ error: "Lottery ID is required" });
    }

    // Fetch the "Like" lottery details
    const lottery = await prisma.lotteryLike.findUnique({
      where: { id: lotteryId },
      select: { id: true } // Fetch only the ID to check if it exists
    });

    if (!lottery) {
      return res.status(404).send({ error: "Lottery not found" });
    }

    // Stop and remove any scheduled jobs for this lottery
    if (scheduledJobs.has(lotteryId)) {
      scheduledJobs.get(lotteryId).stop();
      scheduledJobs.delete(lotteryId);
    }

    // Delete the "Like" lottery
    await prisma.lotteryLike.delete({
      where: { id: lotteryId }
    });

    return res.status(200).send({ message: "Lottery deleted successfully." });
  } catch (error) {
    return res.status(500).send({ error: "Internal server error" });
  }
});