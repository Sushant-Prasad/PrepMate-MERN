import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";


// Start or fetch a DM
const getOrCreateDM = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) throw new ApiError(400, "userId is required");
  if (userId === String(req.user?._id)) throw new ApiError(400, "Cannot DM yourself");


  let convo = await Conversation.findOne({ participants: { $all: [req.user?._id, userId] }, isGroup: false });

  if (!convo) {
    convo = await Conversation.create({ participants: [req.user._id, userId], isGroup: false });
  }

  // Populate users for frontend display
  convo = await Conversation.findById(convo._id).populate(
    "participants",
    "name email avatar"
  );


  return res.status(200).json(new ApiResponse(200, "DM ready", convo));
});


// Fetch messages in a conversation
// conversation.controller.js
const getMessages = asyncHandler(async (req, res) => {
  const { conversationId } = req.params;
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 30;

  // Mark unread messages as read for this user
  await Message.updateMany(
    { conversation: conversationId, readBy: { $ne: req.user._id } },
    { $push: { readBy: req.user._id } }
  );

  const messages = await Message.find({ conversation: conversationId })
    .sort({ createdAt: -1 })
    .skip(page * limit)
    .limit(limit)
    .populate("sender", "name email")
    .populate("readBy", "name email");

  return res.status(200).json(new ApiResponse(200, "Messages", messages.reverse()));
});




const getConversations = asyncHandler(async (req, res) => {
  // Get all conversations for this user
  const conversations = await Conversation.find({
    participants: req.user._id,
  })
    .sort({ updatedAt: -1 })
    .populate("participants", "name email avatar")
    .populate("admin", "name email avatar")
    .populate("lastMessage", "content createdAt sender")
    .populate({
      path: "lastMessage",
      populate: { path: "sender", select: "name email avatar" },
    });

  // Compute unread counts
  const convsWithUnread = await Promise.all(
    conversations.map(async (conv) => {
      const unreadCount = await Message.countDocuments({
        conversation: conv._id,
        readBy: { $ne: req.user._id },
      });
      return { ...conv.toObject(), unreadCount };
    })
  );

  res.status(200).json(new ApiResponse(200, "Conversations", convsWithUnread));
});




// Send a new message
const sendMessage = asyncHandler(async (req, res) => {
  const { conversationId, content } = req.body;

  if (!conversationId || !content) {
    throw new ApiError(400, "Conversation ID and content are required");
  }

  // Create the message
  let message = await Message.create({
    conversation: conversationId,
    sender: req.user._id,  // comes from protect middleware
    content,
  });

  // Update lastMessage on conversation (optional but useful)
  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessageAt: Date.now(),
    lastMessage: message._id,
  });

  message = await message.populate("sender", "name email");

  return res
    .status(201)
    .json(new ApiResponse(201, "Message sent", message));
});

export {
  getOrCreateDM,
  getMessages,
  sendMessage,
  getConversations
}