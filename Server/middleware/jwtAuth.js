// middleware/auth.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import ApiError from "../utils/ApiError.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      req.user = await User.findById(decoded.id).select("-password");
      if (!req.user) throw new ApiError(401, "User not found");

      return next();
    } catch (error) {
      return next(new ApiError(401, "Not authorized, token failed"));
    }
  }

  if (!token) {
    return next(new ApiError(401, "Not authorized, no token"));
  }
};
