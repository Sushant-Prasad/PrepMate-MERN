import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import User from "../models/User.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";


/* CREATE GROUP */
export const createGroup = asyncHandler(async (req, res) => {

  const { name, participants } = req.body;

  if (!name || !participants) {
    throw new ApiError(400, "Group name and participants are required");
  }

  let parsedParticipants;

  try {
    parsedParticipants = JSON.parse(participants);
  } catch {
    throw new ApiError(400, "Participants must be a valid JSON array");
  }

  const uniqueEmails = [...new Set(parsedParticipants)];

  const users = await User.find(
    { email: { $in: uniqueEmails } },
    "_id email name"
  );

  if (!users.length) {
    throw new ApiError(404, "No valid users found");
  }

  const userIds = users.map(u => u._id);

  if (!userIds.some(id => id.toString() === req.user._id.toString())) {
    userIds.push(req.user._id);
  }

  let groupImage = null;

  if (req.file?.path) {
    const upload = await uploadOnCloudinary(req.file.path);
    groupImage = upload.secure_url;
  }

  const group = await Conversation.create({
    name,
    isGroup: true,
    participants: userIds,
    admin: req.user._id,
    groupImage
  });

  res.status(201).json(new ApiResponse(201, "Group created", group));
});


/* GET MY GROUPS */
export const getMyGroups = asyncHandler(async (req, res) => {

  const groups = await Conversation.find({
    participants: req.user._id,
    isGroup: true
  }).populate("participants", "name email avatar");

  res.status(200).json(new ApiResponse(200, "Groups", groups));
});


/* SEARCH GROUPS */
export const searchGroups = asyncHandler(async (req, res) => {

  const query = req.query.query || "";

  const groups = await Conversation.find({
    name: { $regex: query, $options: "i" },
    isGroup: true
  }).select("name groupImage participants");

  res.status(200).json(new ApiResponse(200, "Groups found", groups));
});


/* JOIN GROUP */
export const joinGroup = asyncHandler(async (req, res) => {

  const { groupId } = req.body;

  const group = await Conversation.findById(groupId);

  if (!group || !group.isGroup) {
    throw new ApiError(404, "Group not found");
  }

  const alreadyMember = group.participants.some(
    id => id.toString() === req.user._id.toString()
  );

  if (alreadyMember) {
    throw new ApiError(400, "Already a member");
  }

  group.participants.push(req.user._id);
  await group.save();

  res.status(200).json(new ApiResponse(200, "Joined group", group));
});


/* LEAVE GROUP */
export const leaveGroup = asyncHandler(async (req, res) => {

  const { groupId } = req.body;

  const group = await Conversation.findById(groupId);

  if (!group || !group.isGroup) {
    throw new ApiError(404, "Group not found");
  }

  group.participants = group.participants.filter(
    id => id.toString() !== req.user._id.toString()
  );

  await group.save();

  res.status(200).json(new ApiResponse(200, "Left group", group));
});


/* SEND GROUP MESSAGE */
export const sendGroupMessage = asyncHandler(async (req, res) => {

  const { groupId, content } = req.body;

  const group = await Conversation.findById(groupId);

  if (!group || !group.isGroup) {
    throw new ApiError(404, "Group not found");
  }

  const isMember = group.participants.some(
    id => id.toString() === req.user._id.toString()
  );

  if (!isMember) {
    throw new ApiError(403, "Not a group member");
  }

  if (!content && !req.file) {
    throw new ApiError(400, "Message content or media required");
  }

  let mediaUrl = null;

  if (req.file?.path) {
    const upload = await uploadOnCloudinary(req.file.path);
    mediaUrl = upload.secure_url;
  }

  let message = await Message.create({
    conversation: groupId,
    sender: req.user._id,
    content,
    mediaUrl
  });

  await Conversation.findByIdAndUpdate(groupId, {
    lastMessage: message._id,
    lastMessageAt: new Date()
  });

  message = await message.populate("sender", "name email avatar");

  res.status(201).json(new ApiResponse(201, "Message sent", message));
});