// controllers/groupAdmin.controller.js
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";

// ✅ Delete Group (admin only)
const deleteGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.body;

  const group = await Conversation.findById(groupId);
  if (!group || !group.isGroup) throw new ApiError(404, "Group not found");

  if (group.admin.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only group admin can delete the group");
  }

  await Message.deleteMany({ conversation: groupId });
  await Conversation.findByIdAndDelete(groupId);

  return res.status(200).json(new ApiResponse(200, "Group deleted successfully"));
});

// ✅ Edit Group Name / Image
const editGroup = asyncHandler(async (req, res) => {
  const { groupId, name, groupImage } = req.body;
  const group = await Conversation.findById(groupId);

  if (!group || !group.isGroup) throw new ApiError(404, "Group not found");
  if (group.admin.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only admin can edit group");
  }

  if (name) group.name = name;
  if (req.file?.path) {
    // delete old image if exists
    if (group.groupImagePublicId) {
      await deleteFromCloudinary(group.groupImagePublicId);
    }

    const uploadRes = await uploadOnCloudinary(req.file.path);
    if (!uploadRes || !uploadRes.secure_url) {
      throw new ApiError(500, "Image upload failed");
    }

    group.groupImage = uploadRes.secure_url;        // ✅ string
    group.groupImagePublicId = uploadRes.public_id; // ✅ save for deletion later
  }

  await group.save();
  return res.status(200).json(new ApiResponse(200, "Group updated", group));
});

// ✅ Kick out member
const kickMember = asyncHandler(async (req, res) => {
  const { groupId, memberId } = req.body;

  const group = await Conversation.findById(groupId);
  if (!group || !group.isGroup) throw new ApiError(404, "Group not found");
  if (group.admin.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only admin can remove members");
  }

  group.participants = group.participants.filter(
    (id) => id.toString() !== memberId
  );
  await group.save();

  return res.status(200).json(new ApiResponse(200, "Member removed", group));
});



export {
  deleteGroup,
  editGroup,
  kickMember
}