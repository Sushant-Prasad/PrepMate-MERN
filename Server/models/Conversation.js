import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
{
name: {
type: String,
trim: true,
required: function () {
return this.isGroup;
}
},

groupImage: {
type: String,
default: "https://cdn-icons-png.flaticon.com/512/456/456212.png"
},

groupImagePublicId: {
type: String
},

participants: {
type: [{
type: mongoose.Schema.Types.ObjectId,
ref: "User"
}],
validate: [arr => arr.length >= 2, "Conversation must have at least 2 participants"]
},

isGroup: {
type: Boolean,
default: false
},

unreadCounts: [
{
user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
count: { type: Number, default: 0 }
}
],

lastMessage: {
type: mongoose.Schema.Types.ObjectId,
ref: "Message"
},

lastMessageAt: {
type: Date,
default: Date.now
},

admin: {
type: mongoose.Schema.Types.ObjectId,
ref: "User",
required: function () {
return this.isGroup;
}
}
},
{ timestamps: true }
);

conversationSchema.index({ participants: 1, isGroup: 1 });
conversationSchema.index({ lastMessageAt: -1 });

export default mongoose.model("Conversation", conversationSchema);