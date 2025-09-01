import { createError } from "../utils/error.js";
import jwt from "jsonwebtoken";
// Check if user is authenticated
export const verifyToken = (req, res, next) => {
  // Extract token from cookies 
  const token = req.cookies?.token; 

  if (!token) {
    return next(createError(401, "Not authenticated"));
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    // 🔹 use the same secret key
    if (err) {
      return next(createError(403, "Token is not valid"));
    }

    // Attach user payload (id, role, etc.)
    req.user = decoded;
    next();
  });
};
// Check if user is admin
export const verifyAdmin = (req, res, next) => {
  verifyToken(req, res, () => {
    if (req.user?.role === "admin") {
      next();
    } else {
      return next(createError(403, "Admin access required"));
    }
  });
};
