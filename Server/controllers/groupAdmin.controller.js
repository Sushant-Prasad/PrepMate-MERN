import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import asyncHandler from "../utils/asyncHandler.js";


// DELETE GROUP (ADMIN ONLY)
const deleteGroup = asyncHandler(async (req, res) => {

  const { groupId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    throw new ApiError(400, "Invalid group ID");
  }

  const group = await Conversation.findById(groupId);

  if (!group || !group.isGroup) {
    throw new ApiError(404, "Group not found");
  }

  if (group.admin.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only group admin can delete the group");
  }

  if (group.groupImagePublicId) {
    await deleteFromCloudinary(group.groupImagePublicId);
  }

  await Message.deleteMany({ conversation: groupId });
  await Conversation.findByIdAndDelete(groupId);

  return res.status(200).json(
    new ApiResponse(200, "Group deleted successfully")
  );
});


// EDIT GROUP
const editGroup = asyncHandler(async (req, res) => {

  const { groupId, name } = req.body;

  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    throw new ApiError(400, "Invalid group ID");
  }

  const group = await Conversation.findById(groupId);

  if (!group || !group.isGroup) {
    throw new ApiError(404, "Group not found");
  }

  if (group.admin.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only admin can edit group");
  }

  if (name) {
    group.name = name;
  }

  if (req.file?.path) {

    if (group.groupImagePublicId) {
      await deleteFromCloudinary(group.groupImagePublicId);
    }

    const uploadRes = await uploadOnCloudinary(req.file.path);

    if (!uploadRes || !uploadRes.secure_url) {
      throw new ApiError(500, "Image upload failed");
    }

    group.groupImage = uploadRes.secure_url;
    group.groupImagePublicId = uploadRes.public_id;
  }

  await group.save();

  return res.status(200).json(
    new ApiResponse(200, "Group updated", group)
  );
});


// KICK MEMBER
const kickMember = asyncHandler(async (req, res) => {

  const { groupId, memberId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(groupId)) {
    throw new ApiError(400, "Invalid group ID");
  }

  const group = await Conversation.findById(groupId);

  if (!group || !group.isGroup) {
    throw new ApiError(404, "Group not found");
  }

  if (group.admin.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only admin can remove members");
  }

  if (memberId === req.user._id.toString()) {
    throw new ApiError(400, "Admin cannot remove themselves");
  }

  group.participants = group.participants.filter(
    id => id.toString() !== memberId.toString()
  );

  await group.save();

  return res.status(200).json(
    new ApiResponse(200, "Member removed", group)
  );
});


export {
  deleteGroup,
  editGroup,
  kickMember
};