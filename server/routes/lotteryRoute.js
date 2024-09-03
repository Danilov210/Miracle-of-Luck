import express from "express";
import jwtCheck from "../config/auth0Config.js";
import {
  createLotteryLike,
  createLotteryFundraising,
  createLotteryClassic,
  getAllLotteriesLike,
  getAllLotteriesFundraising,
  getAllLotteriesClassic,
  getLotteryLike,
  getLotteryFundraising,
  getLotteryClassic,

} from "../controllers/LotteryController.js";

const router = express.Router();

router.post("/createLike", createLotteryLike);
router.post("/createFundraising", createLotteryFundraising);
router.post("/createClassic", createLotteryClassic);
router.get("/alllotterylike", getAllLotteriesLike);
router.get("/alllotteryfundraising", getAllLotteriesFundraising);
router.get("/alllotteryclassic", getAllLotteriesClassic);
router.get("/LotteryLike/:id", getLotteryLike);
router.get("/LotteryFundraising/:id", getLotteryFundraising);
router.get("/LotteryClassic/:id", getLotteryClassic);

export { router as lotteryRoute };
