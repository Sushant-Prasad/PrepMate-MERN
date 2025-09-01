import express from "express";
import {
  createAptiQuestion,
  getAptiQuestions,
  getAptiQuestionById,
  deleteAptiQuestion,
  updateAptiQuestion,
} from "../controllers/AptitudeQuestionController.js";
import { verifyAdmin, verifyToken } from "../utils/verifytoken.js";

const aptitudeQuestionRoutes = express.Router();

// @route   POST /api/aptitude-questions
// @desc    Create new aptitude question (admin only)
aptitudeQuestionRoutes.post("/", verifyAdmin, createAptiQuestion);

// @route   GET /api/aptitude-questions
// @desc    Get all aptitude questions (any logged-in user)
aptitudeQuestionRoutes.get("/", verifyToken, getAptiQuestions);

// @route   GET /api/aptitude-questions/:id
// @desc    Get question by ID (any logged-in user)
aptitudeQuestionRoutes.get("/:id", verifyToken, getAptiQuestionById);

// @route   DELETE /api/aptitude-questions/:id
// @desc    Delete aptitude question (admin only)
aptitudeQuestionRoutes.delete("/:id", verifyAdmin, deleteAptiQuestion);

// @route   PUT /api/aptitude-questions/:id
// @desc    Update aptitude question (admin only)
aptitudeQuestionRoutes.put("/:id", verifyAdmin, updateAptiQuestion);

export default aptitudeQuestionRoutes;
