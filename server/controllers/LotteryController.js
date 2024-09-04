import asyncHandler from "express-async-handler";
import { prisma } from "../config/prismaConfig.js";

//++ Function to create a new LotteryLike entry in the database
export const createLotteryLike = asyncHandler(async (req, res) => {
  const {
    hosted,
    title,
    description,
    paticipationdescription,
    endDate,
    image,
    conditions,
    prizes,
    link,
    userEmail, // Use userEmail from the request body
  } = req.body.data;

  try {
    // Create a new LotteryLike entry
    const lotteryLike = await prisma.lotteryLike.create({
      data: {
        hosted,
        title,
        description,
        paticipationdescription,
        startDate: new Date(),
        endDate,
        image,
        conditions: conditions || [],
        prizes: prizes || [],
        link,
        owner: {
          connect: { email: userEmail }, // Correctly use userEmail to connect the owner
        },
      },
    });

    // Update the user's ownedLotteriesLike array with the new lottery ID
    await prisma.user.update({
      where: { email: userEmail }, // Correctly use userEmail
      data: {
        ownedLotteriesLike: {
          connect: { id: lotteryLike.id }, // Connect the new lottery ID to the user's ownedLotteriesLike
        },
      },
    });

    // Fetch and send back the updated user data
    const updatedUser = await prisma.user.findUnique({
      where: { email: userEmail }, // Correctly use userEmail
      include: { ownedLotteriesLike: true }, // Include ownedLotteriesLike in the response
    });

    // Send the response
    console.log("LotteryLike created successfully.");
    return res.status(201).json({
      message: "LotteryLike created successfully.",
      updatedUser, // Include updated user in the response
    });

  } catch (err) {
    // Check if the error is a unique constraint violation
    if (
      err.code === "P2002" &&
      err.meta &&
      err.meta.target.includes("link")
    ) {
      console.error("A lottery with this link already exists.");
      return res
        .status(409)
        .send({ message: "A lottery with this link already exists." });
    }

    // Log and send a generic error message
    console.error("Error creating lotteryLike:", err.message);
    return res
      .status(500)
      .send({ message: "Failed to create lotteryLike. Please try again." });
  }
});


//++ Function to create a new LotteryFundraising entry in the database
export const createLotteryFundraising = asyncHandler(async (req, res) => {
  const {
    hosted,
    title,
    description,
    paticipationdescription,
    endDate,
    image,
    price,
    prizes,
    userEmail, // Use userEmail from the request body
  } = req.body.data;

  try {
    // Create a new LotteryFundraising entry
    const lotteryFundraising = await prisma.lotteryFundraising.create({
      data: {
        hosted,
        title,
        description,
        paticipationdescription,
        startDate: new Date(),
        endDate,
        image,
        price,
        prizes: prizes || [],
        owner: {
          connect: { email: userEmail }, // Correctly use userEmail to connect the owner
        },
      },
    });

    // Update the user's ownedLotteriesFundraising array with the new lottery ID
    await prisma.user.update({
      where: { email: userEmail }, // Correctly use userEmail
      data: {
        ownedLotteriesFundraising: {
          connect: { id: lotteryFundraising.id }, // Connect the new lottery ID to the user's ownedLotteriesFundraising
        },
      },
    });

    // Fetch and send back the updated user data
    const updatedUser = await prisma.user.findUnique({
      where: { email: userEmail }, // Correctly use userEmail
      include: { ownedLotteriesFundraising: true }, // Include ownedLotteriesFundraising in the response
    });

    // Send the response
    console.log("LotteryFundraising created successfully.");
    return res.status(201).json({
      message: "LotteryFundraising created successfully.",
      updatedUser, // Include updated user in the response
    });
  } catch (err) {
    // Log and send a generic error message
    console.error("Error creating LotteryFundraising:", err.message);
    return res
      .status(500)
      .send({ message: "Failed to create LotteryFundraising. Please try again." });
  }
});

//++ Function to create a new LotteryFundraising entry in the database
export const createLotteryClassic = asyncHandler(async (req, res) => {
  const {
    hosted,
    title,
    description,
    image,
    paticipationdescription,
    availableNumberRange,
    drawnNumbersCount,
    endDate,
    price,
    prizes,
    userEmail, // Use userEmail from the request body
  } = req.body.data;

  try {
    // Create a new LotteryFundraising entry
    const lotteryClassic = await prisma.lotteryClassic.create({
      data: {
        hosted,
        title,
        description,
        image,
        paticipationdescription,
        startDate: new Date(),
        endDate,
        availableNumberRange,
        drawnNumbersCount,
        price,
        prizes: prizes || [],
        owner: {
          connect: { email: userEmail }, // Correctly use userEmail to connect the owner
        },
      },
    });

    // Update the user's ownedLotteriesFundraising array with the new lottery ID
    await prisma.user.update({
      where: { email: userEmail }, // Correctly use userEmail
      data: {
        ownedLotteriesClassic: {
          connect: { id: lotteryClassic.id }, // Connect the new lottery ID to the user's ownedLotteriesFundraising
        },
      },
    });

    // Fetch and send back the updated user data
    const updatedUser = await prisma.user.findUnique({
      where: { email: userEmail }, // Correctly use userEmail
      include: { ownedLotteriesClassic: true }, // Include ownedLotteriesFundraising in the response
    });

    // Send the response
    console.log("LotteryClassic created successfully.");
    return res.status(201).json({
      message: "LotteryClassic created successfully.",
      updatedUser, // Include updated user in the response
    });
  } catch (err) {
    // Log and send a generic error message
    console.error("Error creating LotteryClassic:", err.message);
    return res
      .status(500)
      .send({ message: "Failed to create LotteryClassic. Please try again." });
  }
});


//++ Function to get all LotteriesLike
export const getAllLotteriesLike = asyncHandler(async (req, res) => {
  try {
    // Fetch all lotteries, ordered by the createdAt date in descending order
    const lotteries = await prisma.lotteryLike.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    // Send the fetched lotteries as the response
    res.send(lotteries);
  } catch (err) {
    // Log the error message for debugging
    console.error("Error fetching lotteries:", err.message);

    // Send a 500 Internal Server Error response with the error message
    res.status(500).send({ message: "Failed to fetch lotteries. Please try again." });
  }
});

//++ Function to get all LotteriesFundraising
export const getAllLotteriesFundraising = asyncHandler(async (req, res) => {
  try {
    // Fetch all lotteries, ordered by the createdAt date in descending order
    const lotteries = await prisma.lotteryFundraising.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    // Send the fetched lotteries as the response
    res.send(lotteries);
  } catch (err) {
    // Log the error message for debugging
    console.error("Error fetching lotteries:", err.message);

    // Send a 500 Internal Server Error response with the error message
    res.status(500).send({ message: "Failed to fetch lotteries. Please try again." });
  }
});

//++ Function to get all LotteriesFundraising
export const getAllLotteriesClassic = asyncHandler(async (req, res) => {
  try {
    // Fetch all lotteries, ordered by the createdAt date in descending order
    const lotteries = await prisma.lotteryClassic.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    // Send the fetched lotteries as the response
    res.send(lotteries);
  } catch (err) {
    // Log the error message for debugging
    console.error("Error fetching Classic lotteries:", err.message);

    // Send a 500 Internal Server Error response with the error message
    res.status(500).send({ message: "Failed to fetch Classic lotteries. Please try again." });
  }
});

//++ Function to get a specific LotteryLike by ID
export const getLotteryLike = asyncHandler(async (req, res) => {
  const { id } = req.params; // Extract the ID from the request parameters

  try {
    // Find the lottery with the specified ID
    const lotteryLike = await prisma.lotteryLike.findUnique({
      where: { id }, // You can directly use { id } instead of { id: id }
    });

    // If no lottery is found, send a 404 Not Found response
    if (!lotteryLike) {
      console.warn(`Lottery with ID ${id} not found.`);
      return res.status(404).send({ message: "Lottery not found." });
    }

    // Send the found lottery as the response
    return res.status(200).send(lotteryLike);
  } catch (err) {
    // Log the error message for debugging purposes
    console.error("Error fetching lottery:", err.message);

    // Send a 500 Internal Server Error response with the error message
    return res.status(500).send({ message: "Failed to fetch lottery. Please try again." });
  }
});

//++ Function to get a specific LotteriesFundraising by ID
export const getLotteryFundraising = asyncHandler(async (req, res) => {
  const { id } = req.params; // Extract the ID from the request parameters

  try {
    // Find the lottery with the specified ID
    const lotteryFundraising = await prisma.lotteryFundraising.findUnique({
      where: { id }, // You can directly use { id } instead of { id: id }
    });

    // If no lottery is found, send a 404 Not Found response
    if (!lotteryFundraising) {
      console.warn(`Lottery with ID ${id} not found.`);
      return res.status(404).send({ message: "Lottery not found." });
    }

    // Send the found lottery as the response
    return res.status(200).send(lotteryFundraising);
  } catch (err) {
    // Log the error message for debugging purposes
    console.error("Error fetching lottery:", err.message);

    // Send a 500 Internal Server Error response with the error message
    return res.status(500).send({ message: "Failed to fetch lottery. Please try again." });
  }
});

//++ Function to get a specific LotteriesFundraising by ID
export const getLotteryClassic = asyncHandler(async (req, res) => {
  const { id } = req.params; // Extract the ID from the request parameters

  try {
    // Find the lottery with the specified ID
    const lotteryClassic = await prisma.lotteryClassic.findUnique({
      where: { id }, // You can directly use { id } instead of { id: id }
    });

    // If no lottery is found, send a 404 Not Found response
    if (!lotteryClassic) {
      console.warn(`Lottery with ID ${id} not found.`);
      return res.status(404).send({ message: "Lottery not found." });
    }

    // Send the found lottery as the response
    return res.status(200).send(lotteryClassic);
  } catch (err) {
    // Log the error message for debugging purposes
    console.error("Error fetching lottery:", err.message);

    // Send a 500 Internal Server Error response with the error message
    return res.status(500).send({ message: "Failed to fetch lottery. Please try again." });
  }
});



/////////////////////
// Function to get the number of tickets for a specific lottery
export const getNumberOfTicketsForLottery = async (req, res) => {
  console.log("alooo",req.body.data)
  const { lotteryId } = req.body.data;


  try {
    // Find the lottery and include the associated tickets
    const lottery = await prisma.lotteryFundraising.findUnique({
      where: { id: lotteryId },
      include: {
        tickets: true, // Include all related tickets
      },
    });

    // Check if the lottery exists
    if (!lottery) {
      return res.status(404).json({ message: "Lottery not found" });
    }

    // Return the number of tickets
    const numberOfTickets = lottery.tickets.length;
    return res.status(200).json({ numberOfTickets });
  } catch (error) {
    console.error("Error fetching tickets:", error);
    res.status(500).json({ message: "Error fetching tickets. Please try again." });
  }
};
//////////////////////////////////////////////////////////////////