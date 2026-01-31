// // controllers/group.controller.js
// import Conversation from "../models/Conversation.js";
// import Message from "../models/Message.js";
// import { uploadOnCloudinary } from "../utils/cloudinary.js";
// import mongoose from "mongoose";
// import ApiError from "../utils/ApiError.js";
// import ApiResponse from "../utils/ApiResponse.js";
// import asyncHandler from "../utils/asyncHandler.js";

// // ✅ Create Group
// const createGroup = asyncHandler(async (req, res) => {
//   const { name, participants } = req.body;

//   if (!name || !participants?.length) {
//     throw new ApiError(400, "Group name and participants are required");
//   }


//   let parsedParticipants = [];
//   if (typeof participants === "string") {
//     // case: single string from Postman or comma separated
//     parsedParticipants = participants.split(",").map((id) => id.trim());
//   } else if (Array.isArray(participants)) {
//     parsedParticipants = participants;
//   }

//   // Convert to ObjectIds
//   const objectIds = parsedParticipants.map((id) =>
//     new mongoose.Types.ObjectId(id)
//   );


//   let groupImage;
//   if (req.file?.path) {
//     const uploadRes = await uploadOnCloudinary(req.file.path);
//     groupImage = uploadRes.secure_url;
//   }

//   const group = await Conversation.create({
//     name,
//     groupImage,
//     isGroup: true,
//     participants: [...objectIds, req.user._id], // add creator
//     admin: req.user._id,
//   });

//   return res
//     .status(201)
//     .json(new ApiResponse(201, "Group created successfully", group));
// });

// // ✅ Join Group
// const joinGroup = asyncHandler(async (req, res) => {
//   const { groupId } = req.body;

//   const group = await Conversation.findById(groupId);
//   if (!group || !group.isGroup) throw new ApiError(404, "Group not found");

//   if (group.participants.includes(req.user._id)) {
//     throw new ApiError(400, "Already a member of this group");
//   }

//   group.participants.push(req.user._id);
//   await group.save();

//   return res
//     .status(200)
//     .json(new ApiResponse(200, "Joined group successfully", group));
// });

// // ✅ Leave Group
// const leaveGroup = asyncHandler(async (req, res) => {
//   const { groupId } = req.body;

//   const group = await Conversation.findById(groupId);
//   if (!group || !group.isGroup) throw new ApiError(404, "Group not found");

//   group.participants = group.participants.filter(
//     (id) => id.toString() !== req.user._id.toString()
//   );

//   await group.save();

//   return res
//     .status(200)
//     .json(new ApiResponse(200, "Left group successfully", group));
// });

// // ✅ Send Message in Group
// const sendGroupMessage = asyncHandler(async (req, res) => {
//   const { groupId, content } = req.body;

//   const group = await Conversation.findById(groupId);
//   if (!group || !group.isGroup) throw new ApiError(404, "Group not found");

//   if (!group.participants.includes(req.user._id)) {
//     throw new ApiError(403, "You are not a member of this group");
//   }

//   const message = await Message.create({
//     conversation: groupId,
//     sender: req.user._id,
//     content,
//     mediaUrl: req.file?.path || null, // multer + cloudinary
//   });

//   return res
//     .status(201)
//     .json(new ApiResponse(201, "Message sent", message));
// });

// export { createGroup, joinGroup, leaveGroup, sendGroupMessage };


// controllers/group.controller.js
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import Group from "../models/Conversation.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import mongoose from "mongoose";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * ✅ Create Group (accepts emails or IDs)
 */
// const createGroup = asyncHandler(async (req, res) => {
//   const { name, participants } = req.body; // participants = JSON string of emails

//   if (!name || !participants) {
//     throw new ApiError(400, "Group name and participants are required");
//   }

//   // Parse participants safely
//   let parsedParticipants = [];
//   try {
//     parsedParticipants = JSON.parse(participants);
//     if (!Array.isArray(parsedParticipants)) {
//       throw new Error("Participants must be an array");
//     }
//   } catch {
//     throw new ApiError(400, "Participants must be a valid JSON array of emails");
//   }

//   // Clean emails: remove quotes and spaces
//   const cleanedEmails = parsedParticipants.map((e) =>
//     e.replace(/^["']+|["']+$/g, "").trim()
//   );

//   // Find users in DB
//   const users = await User.find({ email: { $in: cleanedEmails } }, "_id email name");
//   if (!users.length) {
//     throw new ApiError(404, `Users not found: ${cleanedEmails.join(", ")}`);
//   }

//   // Map emails to _id
//   const userIds = users.map((u) => u._id);

//   // Include creator
//   if (!userIds.includes(req.user._id)) userIds.push(req.user._id);

//   // Upload group image (optional)
//   let groupImage;
//   if (req.file?.path) {
//     const uploadRes = await uploadOnCloudinary(req.file.path);
//     groupImage = uploadRes.secure_url;
//   }

//   // Create group conversation
//   const group = await Conversation.create({
//     name,
//     isGroup: true,
//     participants: userIds,
//     admin: req.user._id,
//     groupImage,
//   });

//   return res
//     .status(200)
//     .json(new ApiResponse(200, "Group created successfully", group));
// });









const createGroup = asyncHandler(async (req, res) => {
  const { name, participants } = req.body;

  if (!name || !participants) {
    throw new ApiError(400, "Group name and participants are required");
  }

  let parsedParticipants = [];
  try {
    parsedParticipants = JSON.parse(participants);
    if (!Array.isArray(parsedParticipants)) {
      throw new Error();
    }
  } catch {
    throw new ApiError(400, "Participants must be a valid JSON array");
  }

  const cleanedEmails = parsedParticipants.map((e) =>
    e.replace(/^["']+|["']+$/g, "").trim()
  );

  const users = await User.find({ email: { $in: cleanedEmails } }, "_id email name");

  if (!users.length) {
    throw new ApiError(404, "No valid users found for this group");
  }

  const userIds = users.map((u) => u._id);
  if (!userIds.includes(req.user._id)) userIds.push(req.user._id);

  // ❌ Prevent duplicates
  const existing = await Conversation.findOne({
    name,
    isGroup: true,
    participants: { $size: userIds.length, $all: userIds }
  });

  if (existing) {
    throw new ApiError(400, "Group already exists");
  }

  // Image upload (won't break)
  let groupImage = null;
  try {
    if (req.file?.path) {
      const img = await uploadOnCloudinary(req.file.path);
      groupImage = img.secure_url;
    }
  } catch (err) {
    console.error("Cloudinary error:", err);
  }

  const group = await Conversation.create({
    name,
    isGroup: true,
    participants: userIds,
    admin: req.user._id,
    groupImage
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Group created successfully", group));
});




// ----------------- Get My Groups -----------------
export const getMyGroups = asyncHandler(async (req, res) => {
  try {
    const groups = await Group.find({
      participants: req.user._id,
    }).populate("participants", "name email image");

    res.status(200).json(new ApiResponse(200, "Groups", groups));
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ----------------- Search Groups -----------------
export const searchGroups = asyncHandler(async (req, res) => {
  try {
    const query = req.query.query || "";
    const groups = await Group.find({
      name: { $regex: query, $options: "i" },
    }).select("name image participants");

    res.json({ data: groups });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});



/**
 * ✅ Join Group
 */
const joinGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.body;

  const group = await Conversation.findById(groupId);
  if (!group || !group.isGroup) throw new ApiError(404, "Group not found");

  if (group.participants.includes(req.user._id)) {
    throw new ApiError(400, "Already a member of this group");
  }

  group.participants.push(req.user._id);
  await group.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Joined group successfully", group));
});

/**
 * ✅ Leave Group
 */
const leaveGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.body;

  const group = await Conversation.findById(groupId);
  if (!group || !group.isGroup) throw new ApiError(404, "Group not found");

  group.participants = group.participants.filter(
    (id) => id.toString() !== req.user._id.toString()
  );

  await group.save();

  return res
    .status(200)
    .json(new ApiResponse(200, "Left group successfully", group));
});

/**
 * ✅ Send Message in Group
 */
const sendGroupMessage = asyncHandler(async (req, res) => {
  const { groupId, content } = req.body;

  const group = await Conversation.findById(groupId);
  if (!group || !group.isGroup) throw new ApiError(404, "Group not found");

  if (!group.participants.includes(req.user._id)) {
    throw new ApiError(403, "You are not a member of this group");
  }

  const message = await Message.create({
    conversation: groupId,
    sender: req.user._id,
    content,
    mediaUrl: req.file?.path || null,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, "Message sent", message));
});

export { createGroup, joinGroup, leaveGroup, sendGroupMessage };

