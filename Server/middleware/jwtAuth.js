import jwt from "jsonwebtoken";
import User from "../models/User.js";
import UserProfile from "../models/UserProfile.js";
import ApiError from "../utils/ApiError.js";

export const protect = async (req, res, next) => {
  try {
    // ✅ Read token from cookie instead of header
    const token = req.cookies?.token;

    if (!token) {
      return next(new ApiError(401, "Not authorized, no token"));
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Fetch User
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return next(new ApiError(401, "User not found"));
    }

    // ✅ Fetch Profile (Optional but recommended)
    const profile = await UserProfile.findOne({ userId: user._id });

    // ✅ Attach to request
    req.user = user;
    req.profile = profile || null;

    next();

  } catch (error) {
    return next(new ApiError(401, "Not authorized, token failed"));
  }
};
