import mongoose from "mongoose";
import User from "../models/User.js";
import UserProfile from "../models/UserProfile.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Conversation from "../models/Conversation.js";

/**
 * Idempotent + race-safe profile creation.
 */
export const createProfileForUser = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId");
  }

  const user = await User.findById(userId).select("name email");
  if (!user) throw new Error("User not found");

  const profile = await UserProfile.findOneAndUpdate(
    { userId },
    {
      $setOnInsert: {
        userId,
        name: user.name,
        profileImage: "",
        dsaStreak: { currentStreak: 0, bestStreak: 0, lastSolvedDate: null },
        aptitudeStreak: { currentStreak: 0, bestStreak: 0, lastSolvedDate: null },
        recentActivity: [],
      },
    },
    { new: true, upsert: true }
  );

  return profile;
};


/**
 * GET /api/profiles/:userId
 * Returns user profile with joined groups
 */
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId format",
      });
    }

    const profile = await UserProfile.findOne({ userId })
      .select("name profileImage dsaStreak aptitudeStreak recentActivity")
      .lean();

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    /* ---------------- JOINED GROUPS ---------------- */

    const joinedGroups = await Conversation.find({
      participants: new mongoose.Types.ObjectId(userId),
      isGroup: true,
    })
      .select("name groupImage participants")
      .lean();

    const groups = joinedGroups.map((g) => ({
      _id: g._id,
      name: g.name,
      groupImage: g.groupImage,
      members: g.participants.length,
    }));


    /* ---------------- RECENT ACTIVITY ---------------- */

    const recent = Array.isArray(profile.recentActivity)
      ? [...profile.recentActivity]
          .sort((a, b) => new Date(b.solvedAt) - new Date(a.solvedAt))
          .slice(0, 10)
      : [];


    /* ---------------- RESPONSE ---------------- */

    return res.json({
      success: true,
      data: {
        name: profile.name,
        profileImage: profile.profileImage || "",
        dsaStreak:
          profile.dsaStreak || { currentStreak: 0, bestStreak: 0 },
        aptitudeStreak:
          profile.aptitudeStreak || { currentStreak: 0, bestStreak: 0 },
        recentActivity: recent,
        joinedGroups: groups,
      },
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};


/* ------------------ SEARCH USERS ------------------ */

export const searchUsers = asyncHandler(async (req, res) => {
  const q = (req.query.q || req.query.query || "").trim();

  if (!q) {
    return res.status(400).json({
      success: false,
      message: "Query parameter is required",
    });
  }

  const regex = new RegExp(q, "i");

  const users = await User.find(
    { $or: [{ email: regex }, { name: regex }] },
    "_id name email"
  )
    .limit(30)
    .lean();

  return res
    .status(200)
    .json(new ApiResponse(200, "Users found", users));
});


/* ------------------ GET LOGGED IN USER ------------------ */

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) throw new ApiError(404, "User not found");

  return res
    .status(200)
    .json(new ApiResponse(200, "User profile", user));
});