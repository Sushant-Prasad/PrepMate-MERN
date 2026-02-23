import mongoose from "mongoose";


const messageSchema = new mongoose.Schema(
  {
    conversation: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Conversation" 
    },
    group: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "Group" 
    },
    sender: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    body: { 
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
    content: {
      type: String,
      trim: true,
    },
    readBy: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User" 
    }],
  },
  { timestamps: true }
);


export default mongoose.model("Message", messageSchema);






