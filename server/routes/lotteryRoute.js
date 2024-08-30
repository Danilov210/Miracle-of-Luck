import express from "express";
import jwtCheck from "../config/auth0Config.js";
import {
  createResidency,
  getAllLotteries,
  getResidency,
} from "../controllers/ResidencyController.js";

const router = express.Router();

router.post("/create", jwtCheck, createResidency);
router.get("/alllotterylike", getAllLotteries);
router.get("/:id", getResidency);

export { router as lotteryRoute };
