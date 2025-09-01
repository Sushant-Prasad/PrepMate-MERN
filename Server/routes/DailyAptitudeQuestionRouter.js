import express from "express";
import { getTodayDailyAptitude } from "../controllers/DailyAptitudeQuestionController.js";
import { verifyToken } from "../utils/verifytoken.js";
const dailyAptitudeRoutes = express.Router();

dailyAptitudeRoutes.get("/", verifyToken, getTodayDailyAptitude);

export default dailyAptitudeRoutes;