import express from "express";
import jwtCheck from "../config/auth0Config.js";

import {
  createUser,
  getUserOwnedLottories,
  buyTicketFundraising,
  buyTicketClassic,
  getUserOwnedTickets,
  cancelTicket,
  cancelLottery,
  updateUserProfile
} from "../controllers/userController.js";

const router = express.Router();
router.post("/BuyTicketFundraising", buyTicketFundraising);
router.post("/BuyTicketClassic", buyTicketClassic);
router.post("/UserOwnedLottories", getUserOwnedLottories);
router.post("/UserLottoriesTickets", getUserOwnedTickets);
router.post("/register", jwtCheck, createUser);
router.post("/CancelTicket", cancelTicket);
router.post("/CancelLottery", cancelLottery);
router.put("/updateUser", updateUserProfile);


// router.post("/bookVisit/:id", jwtCheck, bookVisit);
// router.post("/allBookings", getAllBookings);
// router.post("/remuveBooking/:id", jwtCheck, cancelBooking);
// router.post("/toFav/:rid", jwtCheck, toFav);
// router.post("/allFav/", jwtCheck, getallFav);

export { router as userRoute };
