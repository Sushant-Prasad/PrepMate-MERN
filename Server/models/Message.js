import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
{
  conversation: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Conversation",
    required: true
  },

  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  content: {
    type: String,
    trim: true
  },

  mediaUrl: {
    type: String
  },

  mediaType: {
    type: String,
    enum: ["image", "video", "file"]
  },

  readBy: {
    type: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }],
    default: []
  }

},
{ timestamps: true }
);

// Indexes for performance
messageSchema.index({ conversation: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });

export default mongoose.model("Message", messageSchema);