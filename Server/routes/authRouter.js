import express from "express";
import {
  registerUser,
  loginUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from "../controllers/authController.js";

const authRouter = express.Router();

// @route   POST /api/users/register
// @desc    Register a new user
authRouter.post("/register", registerUser);

// @route   POST /api/users/login
// @desc    Login user
authRouter.post("/login", loginUser);

// @route   GET /api/users
// @desc    Get all users
authRouter.get("/", getAllUsers);

// @route   GET /api/users/:id
// @desc    Get user by ID
authRouter.get("/:id", getUserById);

// @route   PUT /api/users/:id
// @desc    Update user
authRouter.put("/:id", updateUser);

// @route   DELETE /api/users/:id
// @desc    Delete user
authRouter.delete("/:id", deleteUser);

export default authRouter;
