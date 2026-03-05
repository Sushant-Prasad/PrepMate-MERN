import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";


/* =========================================
   START OR FETCH DIRECT MESSAGE
========================================= */
const getOrCreateDM = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    throw new ApiError(400, "userId is required");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid userId");
  }

  if (userId === req.user._id.toString()) {
    throw new ApiError(400, "Cannot DM yourself");
  }

  // Check if conversation already exists
  let convo = await Conversation.findOne({
    participants: { $all: [req.user._id, userId] },
    isGroup: false
  });

  // If not found create new
  if (!convo) {
    convo = await Conversation.create({
      participants: [req.user._id, userId],
      isGroup: false
    });
  }

  // Populate participants
  convo = await Conversation.findById(convo._id)
    .populate("participants", "name email avatar");

  return res
    .status(200)
    .json(new ApiResponse(200, "DM ready", convo));
});



/* =========================================
   FETCH MESSAGES (WITH PAGINATION)
========================================= */
const getMessages = asyncHandler(async (req, res) => {

  const { conversationId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    throw new ApiError(400, "Invalid conversation ID");
  }

  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 30;

  // Ensure conversation exists
  const conversation = await Conversation.findById(conversationId);
  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  // Mark messages as read
  await Message.updateMany(
    {
      conversation: conversationId,
      readBy: { $ne: req.user._id }
    },
    {
      $push: { readBy: req.user._id }
    }
  );

  const messages = await Message.find({ conversation: conversationId })
    .sort({ createdAt: -1 })
    .skip(page * limit)
    .limit(limit)
    .populate("sender", "name email avatar")
    .populate("readBy", "name email");

  return res
    .status(200)
    .json(new ApiResponse(200, "Messages", messages.reverse()));
});



/* =========================================
   GET USER CONVERSATIONS (CHAT SIDEBAR)
========================================= */
const getConversations = asyncHandler(async (req, res) => {

  const conversations = await Conversation.find({
    participants: req.user._id
  })
    .sort({ updatedAt: -1 })
    .populate("participants", "name email avatar")
    .populate("admin", "name email avatar")
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender",
        select: "name email avatar"
      }
    });

  // Calculate unread messages
  const convsWithUnread = await Promise.all(
    conversations.map(async (conv) => {

      const unreadCount = await Message.countDocuments({
        conversation: conv._id,
        readBy: { $ne: req.user._id }
      });

      return {
        ...conv.toObject(),
        unreadCount
      };
    })
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Conversations", convsWithUnread));
});



/* =========================================
   SEND MESSAGE
========================================= */
const sendMessage = asyncHandler(async (req, res) => {

  const { conversationId, content } = req.body;

  if (!conversationId) {
    throw new ApiError(400, "Conversation ID is required");
  }

  if (!content || content.trim() === "") {
    throw new ApiError(400, "Message content cannot be empty");
  }

  if (!mongoose.Types.ObjectId.isValid(conversationId)) {
    throw new ApiError(400, "Invalid conversation ID");
  }

  // Ensure conversation exists
  const conversation = await Conversation.findById(conversationId);

  if (!conversation) {
    throw new ApiError(404, "Conversation not found");
  }

  // Create message
  let message = await Message.create({
    conversation: conversationId,
    sender: req.user._id,
    content,
    readBy: [req.user._id]
  });

  // Update conversation last message
  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: message._id,
    lastMessageAt: new Date()
  });

  message = await message.populate("sender", "name email avatar");

  return res
    .status(201)
    .json(new ApiResponse(201, "Message sent", message));
});



export {
  getOrCreateDM,
  getMessages,
  getConversations,
  sendMessage
};