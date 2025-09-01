import express from "express";
import { getTodayDailyDSA } from "../controllers/DailyDSAQuestionController.js";
import { verifyToken } from "../utils/verifytoken.js";
const dailyDSArouter = express.Router();

dailyDSArouter.get("/",verifyToken, getTodayDailyDSA);

export default dailyDSArouter;
