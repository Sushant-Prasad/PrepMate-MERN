import express from "express";
import {
  getAllDSA,
  getDSAById,
  createDSA,
  getDSAByCompanyTag,
  getDSAByTag,
  getDSAByDifficulty,
  updateDSA,
  deleteDSA,
} from "../controllers/DSAQuestionController.js";
import { verifyAdmin, verifyToken } from "../utils/verifytoken.js";

const dsaQuestionRoutes = express.Router();

// @route   GET /api/dsa-questions
// @desc    Get all DSA questions (any logged-in user)
dsaQuestionRoutes.get("/", verifyToken, getAllDSA);

// @route   GET /api/dsa-questions/:id
// @desc    Get DSA question by ID (any logged-in user)
dsaQuestionRoutes.get("/:id", verifyToken, getDSAById);

// @route   POST /api/dsa-questions
// @desc    Create a new DSA question (admin only)
dsaQuestionRoutes.post("/", verifyAdmin, createDSA);

// @route   GET /api/dsa-questions/company/:CompanyTag
// @desc    Get DSA questions by company tag (any logged-in user)
dsaQuestionRoutes.get("/company/:CompanyTag", verifyToken, getDSAByCompanyTag);

// @route   GET /api/dsa-questions/tag/:tag
// @desc    Get DSA questions by tag (any logged-in user)
dsaQuestionRoutes.get("/tag/:tag", verifyToken, getDSAByTag);

// @route   GET /api/dsa-questions/difficulty/:level
// @desc    Get DSA questions by difficulty (any logged-in user)
dsaQuestionRoutes.get("/difficulty/:level", verifyToken, getDSAByDifficulty);

// @route   PUT /api/dsa-questions/:id
// @desc    Update a DSA question (admin only)
dsaQuestionRoutes.put("/:id", verifyAdmin, updateDSA);

// @route   DELETE /api/dsa-questions/:id
// @desc    Delete a DSA question (admin only)
dsaQuestionRoutes.delete("/:id", verifyAdmin, deleteDSA);

export default dsaQuestionRoutes;
