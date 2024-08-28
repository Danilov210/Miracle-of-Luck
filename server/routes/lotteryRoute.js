import express from "express";
import {
  createResidency,
  getAllLotteries,
  getResidency,
} from "../controllers/ResidencyController.js";

const router = express.Router();

router.post("/create", createResidency);
router.get("/alllotterylike", getAllLotteries);
router.get("/:id", getResidency);

export { router as lotteryRoute };
