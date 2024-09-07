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
  
} from "../controllers/userController.js";

const router = express.Router();

// Define routes
router.post("/BuyTicketFundraising", buyTicketFundraising);
router.post("/BuyTicketClassic", buyTicketClassic);
router.post("/UserOwnedLottories", getUserOwnedLottories);
router.post("/UserLottoriesTickets", getUserOwnedTickets);
router.post("/register", jwtCheck, createUser);
router.post("/CancelTicket", cancelTicket);
router.post("/CancelLottery", cancelLottery);
router.put("/updateUser", updateUserProfile);
router.post("/createTransaction", createTransaction);
router.post("/getUserTransactions", getUserTransactions);



export { router as userRoute };