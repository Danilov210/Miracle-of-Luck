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

router.post("/register", createUser);
router.post("/bookVisit/:id", bookVisit);
router.post("/allBookings", getAllBookings);
router.post("/remuveBooking/:id", cancelBooking);
router.post("/toFav/:rid", toFav);
router.post("/allFav/", getallFav);
// router.post("/register", jwtCheck, createUser);
// router.post("/bookVisit/:id", jwtCheck, bookVisit);
// router.post("/allBookings", getAllBookings);
// router.post("/remuveBooking/:id", jwtCheck, cancelBooking);
// router.post("/toFav/:rid", jwtCheck, toFav);
// router.post("/allFav/", jwtCheck, getallFav);
export { router as userRoute };
