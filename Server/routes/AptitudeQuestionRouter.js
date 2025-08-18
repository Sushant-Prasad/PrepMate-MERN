// routes/aptitudeQuestionRoutes.js
import express from "express";
import {
  createAptiQuestion,
  getAptiQuestions,
  getAptiQuestionById,
  deleteAptiQuestion,
} from "../controllers/AptitudeQuestionController.js";

const aptitudeQuestionRoutes = express.Router();

aptitudeQuestionRoutes.post("/", createAptiQuestion);
aptitudeQuestionRoutes.get("/", getAptiQuestions);
aptitudeQuestionRoutes.get("/:id", getAptiQuestionById);
aptitudeQuestionRoutes.delete("/:id", deleteAptiQuestion);

export default aptitudeQuestionRoutes;
