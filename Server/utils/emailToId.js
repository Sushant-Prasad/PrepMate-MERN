import User from "../models/User.js";

export const getUserIdsByEmails = async (emails = []) => {
  const users = await User.find({ email: { $in: emails } }, "_id");
  return users.map(u => u._id);
};
