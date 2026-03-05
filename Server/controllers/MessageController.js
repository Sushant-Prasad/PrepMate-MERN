import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

let io;

export const setSocketInstance = (socketIo) => {
  io = socketIo;
};


/* SEND MESSAGE */
const sendMessage = asyncHandler(async (req, res) => {

  const { conversationId, content } = req.body;

  if (!conversationId) {
    throw new ApiError(400, "Conversation ID required");
  }

  if (!content && !req.file) {
    throw new ApiError(400, "Message content or media required");
  }

  let mediaUrl, mediaType;

  if (req.file) {

    let resourceType = "auto";

    if (req.file.mimetype.startsWith("application/")) {
      resourceType = "raw";
    } 
    else if (req.file.mimetype.startsWith("video/")) {
      resourceType = "video";
    } 
    else if (req.file.mimetype.startsWith("image/")) {
      resourceType = "image";
    }

    const upload = await uploadOnCloudinary(req.file.path, resourceType);

    mediaUrl = upload?.secure_url;

    if (resourceType === "image") mediaType = "image";
    else if (resourceType === "video") mediaType = "video";
    else mediaType = "file";
  }

  let msg = await Message.create({
    conversation: conversationId,
    sender: req.user._id,
    content,
    mediaUrl,
    mediaType,
    readBy: [req.user._id],
  });

  await Conversation.findByIdAndUpdate(conversationId, {
    lastMessage: msg._id,
    lastMessageAt: new Date(),
  });

  await msg.populate("sender", "name email avatar");

  if (io) {
    io.to(conversationId.toString()).emit("new_message", msg);
  }

  res.status(201).json(
    new ApiResponse(201, "Message sent", msg)
  );
});



/* DELETE MESSAGE */
const deleteMessage = asyncHandler(async (req, res) => {

  const { messageId } = req.params;

  const message = await Message.findById(messageId);

  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  if (message.sender.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to delete this message");
  }

  await Message.findByIdAndDelete(messageId);

  if (io && message.conversation) {
    io.to(message.conversation.toString()).emit("message_deleted", {
      messageId,
    });
  }

  res.status(200).json(
    new ApiResponse(200, "Message deleted")
  );
});


export {
  sendMessage,
  deleteMessage,
};