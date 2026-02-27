// middleware/auth.js - JWT Authentication Middleware (ES Module)
import jwt from "jsonwebtoken";

export const auth = (req, res, next) => {
  try {
    // Get token from Authorization header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token is not valid" });
  }
};

export const adminAuth = (req, res, next) => {
  auth(req, res, () => {
    if (req.user?.role !== "admin") {
      return res
        .status(403)
        .json({ message: "Access denied. Admin only." });
    }
    next();
  });
};