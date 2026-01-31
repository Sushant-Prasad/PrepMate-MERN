import Message from "../models/Message.js";
import ApiResponse from "../utils/ApiResponse.js";
import ApiError from "../utils/ApiError.js";
import asyncHandler from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js"

let io; // will be set from server.js
export const setSocketInstance = (socketIo) => {
    io = socketIo;
};

const sendMessage = asyncHandler(async (req, res) => {
    const { conversationId, groupId, content } = req.body;
    let mediaUrl, mediaType;

    console.log("BODY:", req.body);
    console.log("FILE:", req.file);

    if (req.file) {
        // Decide resourceType based on MIME
        let resourceType = "auto";
        if (req.file.mimetype.startsWith("application/")) {
            resourceType = "raw"; // PDFs, docs, zips
        } else if (req.file.mimetype.startsWith("video/")) {
            resourceType = "video";
        } else if (req.file.mimetype.startsWith("image/")) {
            resourceType = "image";
        }

        const upload = await uploadOnCloudinary(req.file.path, resourceType);

        mediaUrl = upload?.secure_url;
        mediaType =
            resourceType === "image"
                ? "image"
                : resourceType === "video"
                    ? "video"
                    : "file";
    }

    const msg = await Message.create({
        conversation: conversationId || null,
        group: groupId || null,
        sender: req.user._id,
        content,
        mediaUrl,
        mediaType,
        readBy: [req.user._id],
    });

    await msg.populate("sender", "name email");

    // ✅ Emit real-time event via Socket.IO
    const targetRoom = conversationId || groupId;
    if (io && targetRoom) {
        io.to(targetRoom).emit("new_message", msg);
    }

    res.status(201).json(new ApiResponse(201, "Message sent", msg));
});



const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  const message = await Message.findById(messageId);
  if (!message) throw new ApiError(404, "Message not found");

  // only sender OR admin of conversation can delete
  if (message.sender.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Not authorized to delete this message");
  }

  await Message.findByIdAndDelete(messageId);

  // Emit to all clients in the conversation/group
  const targetRoom = message.conversation || message.group;
  if (io && targetRoom) {
    io.to(targetRoom.toString()).emit("message_deleted", { messageId });
  }

  return res.status(200).json(new ApiResponse(200, "Message deleted"));
});






export {
    sendMessage,
    deleteMessage,
}