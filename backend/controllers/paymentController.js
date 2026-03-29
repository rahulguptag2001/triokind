// controllers/paymentController.js
import Razorpay from "razorpay";
import crypto from "crypto";
import pool from "../config/database.js";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// ─────────────────────────────────────────────────────────────────────────────
// Create Razorpay order
// ─────────────────────────────────────────────────────────────────────────────
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body; // Amount in rupees
    const numericAmount = Number(amount);

    if (!numericAmount || Number.isNaN(numericAmount) || numericAmount <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Valid amount is required" });
    }

    const options = {
      amount: Math.round(numericAmount * 100), // convert to paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1,
    };

    const order = await razorpay.orders.create(options);

    res.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID, // safe to expose to frontend
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to create payment order" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Verify Razorpay payment and create DB order
//
// This is the SINGLE place where a Razorpay order gets saved to the database.
// createOrder in orderController.js handles COD only.
//
// FIX 1 — Amount was taken from req.body (client-controlled).
//          A malicious user could send totalAmount: 1 and get ₹10,000 worth of
//          goods for ₹1.  We now fetch the canonical amount directly from the
//          Razorpay API so the client cannot tamper with it.
//
// FIX 2 — shippingAddress.country had no default value, causing NULL to be
//          stored when the frontend omitted it.
// ─────────────────────────────────────────────────────────────────────────────
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDetails,
    } = req.body;

    // ── 1. Verify signature ──────────────────────────────────────────────────
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "razorpay_order_id, razorpay_payment_id and razorpay_signature are required",
      });
    }

    const sign = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (razorpay_signature !== expectedSign) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed. Invalid signature.",
      });
    }

    // ── 2. Fetch canonical amount from Razorpay (never trust the client) ─────
    // FIX: previously `totalAmount` came from `req.body.orderDetails.totalAmount`
    // which is fully client-controlled — an attacker could send any value.
    let totalAmount;
    try {
      const razorpayOrder = await razorpay.orders.fetch(razorpay_order_id);
      totalAmount = razorpayOrder.amount / 100; // paise → rupees
    } catch (fetchErr) {
      console.error("Failed to fetch Razorpay order:", fetchErr);
      return res.status(502).json({
        success: false,
        message: "Could not verify order amount with Razorpay. Please contact support.",
      });
    }

    const { items, shippingAddress } = orderDetails;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    if (
      !shippingAddress ||
      !shippingAddress.address_line1 ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.postal_code
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete shipping address is required",
      });
    }

    // ── 3. Database transaction ──────────────────────────────────────────────
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const userId = req.user.id;

      // Resolve or create address
      let addressId;

      if (shippingAddress.id) {
        // Re-use an address the user saved previously
        const [addressRows] = await connection.query(
          "SELECT id FROM addresses WHERE id = ? AND user_id = ?",
          [shippingAddress.id, userId]
        );

        if (!addressRows.length) {
          throw new Error("Invalid address for this user");
        }

        addressId = addressRows[0].id;
      } else {
        // Create a new address snapshot for this order
        const [addressResult] = await connection.query(
          `INSERT INTO addresses
           (user_id, address_line1, address_line2, city, state, postal_code, country)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            shippingAddress.address_line1,
            shippingAddress.address_line2 || null,
            shippingAddress.city,
            shippingAddress.state,
            shippingAddress.postal_code,
            shippingAddress.country || "India", // FIX: default was missing
          ]
        );
        addressId = addressResult.insertId;
      }

      // Create order
      const [orderResult] = await connection.query(
        `INSERT INTO orders
         (user_id, address_id, total_amount, payment_method, payment_status, status,
          razorpay_order_id, razorpay_payment_id, razorpay_signature)
         VALUES (?, ?, ?, 'razorpay', 'completed', 'processing', ?, ?, ?)`,
        [
          userId,
          addressId,
          totalAmount,
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
        ]
      );

      const orderId = orderResult.insertId;

      // Insert order items & decrement stock
      for (const item of items) {
        const productId = item.productId || item.id;
        const quantity = parseInt(item.quantity, 10);

        if (!productId) throw new Error("Missing productId in cart item");
        if (!quantity || quantity <= 0)
          throw new Error(`Invalid quantity for product ${productId}`);

        const [products] = await connection.query(
          "SELECT price, stock_quantity FROM products WHERE id = ?",
          [productId]
        );

        if (!products.length)
          throw new Error(`Product ${productId} not found`);

        if (products[0].stock_quantity < quantity)
          throw new Error(`Insufficient stock for product ${productId}`);

        await connection.query(
          "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
          [orderId, productId, quantity, products[0].price]
        );

        await connection.query(
          "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?",
          [quantity, productId]
        );
      }

      await connection.commit();

      res.json({
        success: true,
        message: "Payment verified and order created successfully",
        orderId,
        razorpay_payment_id,
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Payment verification failed",
    });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Get payment details (Admin)
// ─────────────────────────────────────────────────────────────────────────────
export const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await razorpay.payments.fetch(paymentId);
    res.json({ success: true, payment });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch payment details" });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Initiate refund (Admin)
// ─────────────────────────────────────────────────────────────────────────────
export const initiateRefund = async (req, res) => {
  try {
    const { paymentId, amount } = req.body;

    if (!paymentId || !amount) {
      return res
        .status(400)
        .json({ success: false, message: "paymentId and amount are required" });
    }

    const refund = await razorpay.payments.refund(paymentId, {
      amount: Math.round(Number(amount) * 100), // paise
      speed: "normal",
    });

    await pool.query(
      "UPDATE orders SET status = ?, payment_status = ? WHERE razorpay_payment_id = ?",
      ["cancelled", "refunded", paymentId]
    );

    res.json({
      success: true,
      message: "Refund initiated successfully",
      refund,
    });
  } catch (error) {
    console.error("Refund error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to initiate refund" });
  }
};