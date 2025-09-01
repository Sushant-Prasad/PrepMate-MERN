import express from "express";
import {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
  logoutUser
} from "../controllers/authController.js";
import { verifyAdmin, verifyToken } from "../utils/verifytoken.js";

const authRouter = express.Router();

// @route   POST /api/users/register
// @desc    Register a new user
authRouter.post("/register", registerUser);

// @route   POST /api/users/login
// @desc    Login user
authRouter.post("/login", loginUser);
// @route   POST /api/users/logout
// @desc    Logout user
authRouter.post("/logout", verifyToken, logoutUser); 

// @route   GET /api/users
// @desc    Get all users (admin only)
authRouter.get("/", verifyAdmin, getAllUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID (authenticated)
authRouter.get("/:id", verifyToken, getUserById);

// @route   PUT /api/users/:id
// @desc    Update user (authenticated)
authRouter.put("/:id", verifyToken, updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user (admin only)
authRouter.delete("/:id", verifyAdmin, deleteUser);

export default authRouter;
