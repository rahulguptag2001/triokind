// routes/payment.js
import express from "express";

import {
  createRazorpayOrder,
  verifyPayment,
  getPaymentDetails,
  initiateRefund,
} from "../controllers/paymentController.js";

import { auth, adminAuth } from "../middleware/auth.js";

const router = express.Router();

// @route   POST /api/payment/create-order
// @desc    Create Razorpay order
// @access  Private
router.post("/create-order", auth, createRazorpayOrder);

// @route   POST /api/payment/verify
// @desc    Verify Razorpay payment and create order
// @access  Private
router.post("/verify", auth, verifyPayment);

// @route   GET /api/payment/:paymentId
// @desc    Get payment details
// @access  Private/Admin
router.get("/:paymentId", adminAuth, getPaymentDetails);

// @route   POST /api/payment/refund
// @desc    Initiate refund
// @access  Private/Admin
router.post("/refund", adminAuth, initiateRefund);

export default router;