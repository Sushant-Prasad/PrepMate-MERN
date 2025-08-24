import mongoose from "mongoose";
import User from "../models/User.js";
import UserProfile from "../models/UserProfile.js";
import "../models/StudyRoom.js"; // ensure model is registered for populate

/**
 * Idempotent + race-safe profile creation.
 * Uses your schema's dsaStreak/aptitudeStreak fields.
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
        joinedRooms: [],
      },
    },
    { new: true, upsert: true }
  );

  return profile;
};

/**
 * GET /api/profiles/:userId
 * Returns name, profileImage, dsaStreak, aptitudeStreak, recentActivity, joinedRooms (names only)
 */
export const getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ success: false, message: "Invalid userId format" });
    }

    const profile = await UserProfile.findOne({ userId })
      .select("name profileImage dsaStreak aptitudeStreak recentActivity joinedRooms")
      .populate({ path: "joinedRooms", select: "name" })
      .lean(); // return plain object

    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    // Map rooms to just their names (or keep as [] if none)
    const joinedRoomNames = Array.isArray(profile.joinedRooms)
      ? profile.joinedRooms.map(r => r?.name).filter(Boolean)
      : [];

    // Optionally, cap recentActivity to last 10 (remove if you want the full array)
    const recent = Array.isArray(profile.recentActivity)
      ? [...profile.recentActivity]
          .sort((a, b) => new Date(b.solvedAt) - new Date(a.solvedAt))
          .slice(0, 10)
      : [];

    return res.json({
      success: true,
      data: {
        name: profile.name,
        profileImage: profile.profileImage || "",
        dsaStreak: profile.dsaStreak || { currentStreak: 0, bestStreak: 0, lastSolvedDate: null },
        aptitudeStreak: profile.aptitudeStreak || { currentStreak: 0, bestStreak: 0, lastSolvedDate: null },
        recentActivity: recent,
        joinedRooms: joinedRoomNames,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message,
    });
  }
};
