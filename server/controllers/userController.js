import asyncHandler from "express-async-handler";
import { prisma } from "../config/prismaConfig.js";

//function create user
export const createUser = asyncHandler(async (req, res) => {
  console.log("creating a user");

  let { email } = req.body;

  const userExists = await prisma.user.findUnique({ where: { email: email } });
  if (!userExists) {
    const user = await prisma.user.create({ data: req.body });
    res.send({
      massage: "User registered successfully",
      user: user,
    });
  } else res.status(201).send({ massage: "User already registered" });
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
