const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const { auth, adminAuth } = require('../middleware/auth');

// @route   POST /api/payment/create-order
// @desc    Create Razorpay order
// @access  Private
router.post('/create-order', auth, paymentController.createRazorpayOrder);

// @route   POST /api/payment/verify
// @desc    Verify Razorpay payment and create order
// @access  Private
router.post('/verify', auth, paymentController.verifyPayment);

// @route   GET /api/payment/:paymentId
// @desc    Get payment details
// @access  Private/Admin
router.get('/:paymentId', adminAuth, paymentController.getPaymentDetails);

// @route   POST /api/payment/refund
// @desc    Initiate refund
// @access  Private/Admin
router.post('/refund', adminAuth, paymentController.initiateRefund);

module.exports = router;