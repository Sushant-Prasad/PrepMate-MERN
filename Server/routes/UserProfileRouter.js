import express from "express";
import {
  getUserProfile,
  searchUsers,
  getMe,
  uploadProfileImage,
  deleteProfileImage
} from "../controllers/UserProfileController.js";

import { verifyToken } from "../utils/verifytoken.js";
import { protect } from "../middleware/jwtAuth.js";
import upload from "../middleware/multer.js";

const profileRouter = express.Router();


/* ---------------- VERIFY SELF OR ADMIN ---------------- */

const verifySelfOrAdmin = (req, res, next) => {

  if (req.user.id === req.params.userId || req.user.role === "admin") {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: "Forbidden"
  });

};


/* ---------------- PROFILE ROUTES ---------------- */


/**
 * GET logged-in user
 * GET /api/profiles/me
 */
profileRouter.get("/me", protect, getMe);


/**
 * SEARCH USERS
 * GET /api/profiles/search?q=
 */
profileRouter.get("/search", protect, searchUsers);


/**
 * GET USER PROFILE
 * GET /api/profiles/:userId
 */
profileRouter.get("/:userId", verifyToken, verifySelfOrAdmin, getUserProfile);


/**
 * UPLOAD PROFILE IMAGE
 * POST /api/profiles/upload-photo
 */
profileRouter.post(
  "/upload-photo",
  protect,
  upload.single("image"),
  uploadProfileImage
);


/**
 * DELETE PROFILE IMAGE
 * DELETE /api/profiles/delete-photo
 */
profileRouter.delete(
  "/delete-photo",
  protect,
  deleteProfileImage
);


export default profileRouter;