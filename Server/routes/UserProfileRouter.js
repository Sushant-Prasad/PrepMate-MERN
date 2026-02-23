import express, { Router } from "express";
import { getUserProfile, searchUsers, getMe } from "../controllers/UserProfileController.js";
import { verifyToken } from "../utils/verifytoken.js";
import { protect } from "../middleware/jwtAuth.js";

const profileRouter = express.Router();
export const router = Router();

/**
 * Middleware: allow only self or admin to access a profile
 */
const verifySelfOrAdmin = (req, res, next) => {
  if (req.user.id === req.params.userId || req.user.role === "admin") {
    return next();
  }
  return res.status(403).json({ success: false, message: "Forbidden" });
};

/**
 * @route   GET /api/profiles/:userId
 * @desc    Get user profile by userId
 * @access  Private (self or admin)
 */
profileRouter.get("/:userId", verifyToken, verifySelfOrAdmin, getUserProfile);
profileRouter.get("/user/search", protect, searchUsers);
router.get("/me", protect, getMe);



export default profileRouter;
