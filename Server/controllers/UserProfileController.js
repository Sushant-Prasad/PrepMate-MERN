import mongoose from "mongoose";
import User from "../models/User.js";
import UserProfile from "../models/UserProfile.js";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Conversation from "../models/Conversation.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";


/* ------------------ CREATE PROFILE ------------------ */

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
        profileImagePublicId: "",
        dsaStreak: {
          currentStreak: 0,
          bestStreak: 0,
          lastSolvedDate: null
        },
        aptitudeStreak: {
          currentStreak: 0,
          bestStreak: 0,
          lastSolvedDate: null
        },
        recentActivity: [],
      }
    },
    { new: true, upsert: true }
  );

  return profile;
};



/* ------------------ GET USER PROFILE ------------------ */

export const getUserProfile = async (req, res) => {

  try {

    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid userId format"
      });
    }

    const profile = await UserProfile.findOne({ userId })
      .select("name profileImage dsaStreak aptitudeStreak recentActivity");

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found"
      });
    }


    /* ---------- STREAK VALIDATION ---------- */

    const today = new Date();
    today.setHours(0,0,0,0);

    const validateStreak = async (streakField) => {

      const streak = profile[streakField];

      if (!streak?.lastSolvedDate) return;

      const last = new Date(streak.lastSolvedDate);
      last.setHours(0,0,0,0);

      const diffDays = Math.floor((today - last) / (1000 * 60 * 60 * 24));

      if (diffDays > 1 && streak.currentStreak !== 0) {
        streak.currentStreak = 0;
        await profile.save();
      }

    };

    await validateStreak("aptitudeStreak");
    await validateStreak("dsaStreak");


    /* ---------- JOINED GROUPS ---------- */

    const joinedGroups = await Conversation.find({
      participants: userId,
      isGroup: true
    })
      .select("name groupImage participants")
      .lean();

    const groups = joinedGroups.map((g) => ({
      _id: g._id,
      name: g.name,
      groupImage: g.groupImage,
      members: g.participants.length
    }));


    /* ---------- RECENT ACTIVITY ---------- */

    const recent = Array.isArray(profile.recentActivity)
      ? [...profile.recentActivity]
          .sort((a,b) => new Date(b.solvedAt) - new Date(a.solvedAt))
          .slice(0,10)
      : [];


    /* ---------- RESPONSE ---------- */

    return res.json({
      success: true,
      data: {
        name: profile.name,
        profileImage: profile.profileImage || "",
        dsaStreak: profile.dsaStreak || { currentStreak: 0, bestStreak: 0 },
        aptitudeStreak: profile.aptitudeStreak || { currentStreak: 0, bestStreak: 0 },
        recentActivity: recent,
        joinedGroups: groups
      }
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
      error: error.message
    });

  }

};



/* ------------------ SEARCH USERS ------------------ */

export const searchUsers = asyncHandler(async (req, res) => {

  const q = (req.query.q || req.query.query || "").trim();

  if (!q) {
    return res.status(400).json({
      success: false,
      message: "Query parameter is required"
    });
  }

  const regex = new RegExp(q, "i");

  const users = await User.find(
    { $or: [{ email: regex }, { name: regex }] },
    "_id name email"
  )
    .limit(30)
    .lean();

  return res.status(200).json(
    new ApiResponse(200, "Users found", users)
  );

});



/* ------------------ GET LOGGED IN USER ------------------ */

export const getMe = asyncHandler(async (req, res) => {

  const user = await User.findById(req.user._id).select("-password");

  if (!user) throw new ApiError(404, "User not found");

  return res.status(200).json(
    new ApiResponse(200, "User profile", user)
  );

});



/* ------------------ UPLOAD PROFILE IMAGE ------------------ */

export const uploadProfileImage = asyncHandler(async (req, res) => {

  const userId = req.user._id;

  if (!req.file) {
    throw new ApiError(400, "Image file is required");
  }

  const profile = await UserProfile.findOne({ userId });

  if (!profile) {
    throw new ApiError(404, "Profile not found");
  }


  /* delete old image */

  if (profile.profileImagePublicId) {
    try {
      await deleteFromCloudinary(profile.profileImagePublicId);
    } catch (err) {
      console.warn("Cloudinary delete failed:", err.message);
    }
  }


  const upload = await uploadOnCloudinary(req.file.path, "image");

  if (!upload) {
    throw new ApiError(500, "Image upload failed");
  }

  profile.profileImage = upload.secure_url;
  profile.profileImagePublicId = upload.public_id;

  await profile.save();

  return res.status(200).json(
    new ApiResponse(200, "Profile image updated", {
      profileImage: upload.secure_url,
      publicId: upload.public_id
    })
  );

});



/* ------------------ DELETE PROFILE IMAGE ------------------ */

export const deleteProfileImage = asyncHandler(async (req, res) => {

  const userId = req.user._id;

  const profile = await UserProfile.findOne({ userId });

  if (!profile) {
    throw new ApiError(404, "Profile not found");
  }

  if (profile.profileImagePublicId && profile.profileImagePublicId !== "") {
    try {
      await deleteFromCloudinary(profile.profileImagePublicId);
    } catch (err) {
      console.warn("Cloudinary delete failed:", err.message);
    }
  }

  profile.profileImage = "";
  profile.profileImagePublicId = "";

  await profile.save();

  return res.status(200).json(
    new ApiResponse(200, "Profile image deleted")
  );

});