import express from "express";
import { getTodayDailyAptitude } from "../controllers/DailyAptitudeQuestionController.js";
const dailyAptitudeRoutes = express.Router();

dailyAptitudeRoutes.get("/", getTodayDailyAptitude);

export default dailyAptitudeRoutes;