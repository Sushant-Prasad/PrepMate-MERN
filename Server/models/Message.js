import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: "StudyRoom" }, // null for direct messages
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserProfile",
      required: true,
    },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "UserProfile" }, // only for direct messages
    type: {
      type: String,
      enum: ["text", "file", "image", "pdf", "link"],
      default: "text",
    },
    content: { type: String, required: true }, // message text OR file URL
    fileName: { type: String },
    fileType: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Message", messageSchema);
