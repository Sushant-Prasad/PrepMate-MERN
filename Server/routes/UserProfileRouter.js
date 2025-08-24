import express from "express";
import {  getUserProfile } from "../controllers/UserProfileController.js";

;

const profileRouter = express.Router();

/**
 * @route   GET /api/profiles/:userId
 * @desc    Get user profile by userId
 * @access  Private/User
 */
profileRouter.get("/:userId", getUserProfile);


export default profileRouter;
