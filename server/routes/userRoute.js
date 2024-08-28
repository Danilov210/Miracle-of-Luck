import express from "express";
import jwtCheck from "../config/auth0Config.js";

import {
  bookVisit,
  cancelBooking,
  createUser,
  getAllBookings,
  getallFav,
  toFav,
} from "../controllers/userController.js";

const router = express.Router();

router.post("/register", jwtCheck, createUser);
router.post("/bookVisit/:id", bookVisit);
router.post("/allBookings", getAllBookings);
router.post("/remuveBooking/:id", cancelBooking);
router.post("/toFav/:rid", toFav);
router.post("/allFav/", getallFav);
export { router as userRoute };
