// Import necessary modules
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
  updateUserProfile,
  createTransaction,
  getUserTransactions,
  cancelLikeLottery,

} from "../controllers/userController.js";

const router = express.Router();

// Define routes
router.post("/register", createUser);
router.post("/BuyTicketFundraising", buyTicketFundraising);
router.post("/BuyTicketClassic", buyTicketClassic);
router.post("/UserOwnedLottories", getUserOwnedLottories);
router.post("/UserLottoriesTickets", getUserOwnedTickets);
router.post("/CancelTicket", cancelTicket);
router.post("/CancelLottery", cancelLottery);
router.put("/updateUser", updateUserProfile);
router.post("/createTransaction", createTransaction);
router.post("/getUserTransactions", getUserTransactions);
router.post("/CancelLotteryLike", cancelLikeLottery);

export { router as userRoute };