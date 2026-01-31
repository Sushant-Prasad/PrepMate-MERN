import mongoose from "mongoose";


const conversationSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
        },
        groupImage: {
            type: String, // Cloudinary URL
            default: "https://cdn-icons-png.flaticon.com/512/456/456212.png", // fallback
        },
        groupImagePublicId: {
            type: String
        },
        participants: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "UserProfile",
                required: true
            }
        ],
        isGroup: {
            type: Boolean,
            default: false
        },
        unreadCounts: [
            {
                user: { type: mongoose.Schema.Types.ObjectId, ref: "UserProfile" },
                count: { type: Number, default: 0 },
            },
        ],
        group: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group"
        }, // only if group
        lastMessageAt: {
            type: Date,
            default: Date.now
        },
        admin: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "UserProfile",
        }
    },
    { timestamps: true }
);


conversationSchema.index({ participants: 1 });


export default mongoose.model("Conversation", conversationSchema);