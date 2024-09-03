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


//function to  book visit to residncy
export const bookVisit = asyncHandler(async (req, res) => {
  const { email, date } = req.body;
  const { id } = req.params;

  try {
    const alreadyBooked = await prisma.user.findUnique({
      where: { email: email },
      select: { bookedVisits: true },
    });
    if (alreadyBooked.bookedVisits.some((visit) => visit.id === id)) {
      res
        .status(400)
        .json({ massage: "This residency is already booked by you" });
    } else {
      await prisma.user.update({
        where: { email: email },
        data: {
          bookedVisits: { push: { id, date } },
        },
      });
      res.send("You visit booked successfully");
    }
  } catch (err) {
    throw new Error(err.massage);
  }
});

//function that get all bookings of a user
export const getAllBookings = asyncHandler(async (req, res) => {
  const { email } = req.body;

  try {
    const bookings = await prisma.user.findUnique({
      where: { email },
      select: { bookedVisits: true },
    });
    res.status(200).send(bookings);
  } catch (err) {
    throw new Error(err.massage);
  }
});

//function to cancel booking

export const cancelBooking = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const { id } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { bookedVisits: true },
    });
    const index = user.bookedVisits.findIndex((visit) => visit.id === id);
    if (index === -1) {
      res.status(404).json({ message: "Booking not found" });
    } else {
      user.bookedVisits.splice(index, 1);
      await prisma.user.update({
        where: { email },
        data: {
          bookedVisits: user.bookedVisits,
        },
      });
      res.send("Booking cancelled successfully");
    }
  } catch (err) {
    throw new Error(err.massage);
  }
});

//function to add a resd in favourite list
export const toFav = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const { rid } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (user.favResidenceID.includes(rid)) {
      const updateUser = await prisma.user.update({
        where: { email },
        data: {
          favResidenceID: {
            set: user.favResidenceID.filter((id) => id !== rid),
          },
        },
      });
      res.send({
        massage: "Residencies remuved from favorites",
        user: updateUser,
      });
    } else {
      const updateUser = await prisma.user.update({
        where: { email },
        data: {
          favResidenceID: {
            push: rid,
          },
        },
      });
      res.send({ massage: "Updated favorites", user: updateUser });
    }
  } catch (err) {
    throw new Error(err.massage);
  }
});

//function that show all favorite residensies
export const getallFav = asyncHandler(async (req, res) => {
  const { email } = req.body;
  try {
    const favResd = await prisma.user.findUnique({
      where: { email },
      select: { favResidenceID: true },
    });
    res.status(200).send(favResd);
  } catch (err) {
    throw new Error(err.massage);
  }
});


// Function to get a user and their owned lotteries
export const getUserWithLotteries = asyncHandler(async (req, res) => {
  const { email } = req.params; // Assuming email is provided as a route parameter

  try {
    const user = await prisma.user.findUnique({
      where: { email },

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





