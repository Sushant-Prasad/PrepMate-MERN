import express from "express";
import { getTodayDailyDSA } from "../controllers/DailyDSAQuestionController.js";

const dailyDSArouter = express.Router();

dailyDSArouter.get("/", getTodayDailyDSA);

export default dailyDSArouter;
