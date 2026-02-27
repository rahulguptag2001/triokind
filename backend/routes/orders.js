// routes/orders.js
import express from "express";

import {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders,
} from "../controllers/orderController.js";

import { auth, adminAuth } from "../middleware/auth.js";

const router = express.Router();

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post("/", auth, createOrder);

// @route   GET /api/orders
// @desc    Get user orders
// @access  Private
router.get("/", auth, getUserOrders);

// @route   GET /api/orders/:id
// @desc    Get single order
// @access  Private
router.get("/:id", auth, getOrderById);

// @route   PUT /api/orders/:id/status
// @desc    Update order status
// @access  Private/Admin
router.put("/:id/status", adminAuth, updateOrderStatus);

// @route   GET /api/orders/admin/all
// @desc    Get all orders
// @access  Private/Admin
router.get("/admin/all", adminAuth, getAllOrders);

export default router;