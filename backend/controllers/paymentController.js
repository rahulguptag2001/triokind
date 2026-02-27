// controllers/paymentController.js
import Razorpay from "razorpay";
import crypto from "crypto";
import pool from "../config/database.js";

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay order
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body; // Amount in rupees

    const options = {
      amount: Math.round(amount * 100), // paise
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
      keyId: process.env.RAZORPAY_KEY_ID, // safe for frontend
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create payment order",
    });
  }
};

// Verify Razorpay payment and create order
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDetails,
    } = req.body;

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

    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      const userId = req.user.id;
      const { items, shippingAddress, totalAmount } = orderDetails;

      // Create address if not exists
      let addressId;
      if (shippingAddress.id) {
        addressId = shippingAddress.id;
      } else {
        const [addressResult] = await connection.query(
          `INSERT INTO addresses 
           (user_id, address_line1, address_line2, city, state, postal_code, country)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            userId,
            shippingAddress.address_line1,
            shippingAddress.address_line2,
            shippingAddress.city,
            shippingAddress.state,
            shippingAddress.postal_code,
            shippingAddress.country,
          ]
        );
        addressId = addressResult.insertId;
      }

      // Create order
      const [orderResult] = await connection.query(
        `INSERT INTO orders
         (user_id, address_id, total_amount, payment_method, payment_status, status,
          razorpay_order_id, razorpay_payment_id)
         VALUES (?, ?, ?, 'razorpay', 'completed', 'processing', ?, ?)`,
        [
          userId,
          addressId,
          totalAmount,
          razorpay_order_id,
          razorpay_payment_id,
        ]
      );

      const orderId = orderResult.insertId;

      // Create order items & update stock
      for (const item of items) {
        const [products] = await connection.query(
          "SELECT price, stock_quantity FROM products WHERE id = ?",
          [item.productId]
        );

        if (!products.length) {
          throw new Error(`Product ${item.productId} not found`);
        }

        if (products[0].stock_quantity < item.quantity) {
          throw new Error(`Insufficient stock for product ${item.productId}`);
        }

        await connection.query(
          "INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)",
          [orderId, item.productId, item.quantity, products[0].price]
        );

        await connection.query(
          "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?",
          [item.quantity, item.productId]
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

// Get payment details (Admin)
export const getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await razorpay.payments.fetch(paymentId);

    res.json({ success: true, payment });
  } catch (error) {
    console.error("Error fetching payment details:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payment details",
    });
  }
};

// Initiate refund (Admin)
export const initiateRefund = async (req, res) => {
  try {
    const { paymentId, amount } = req.body;

    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount * 100,
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
    res.status(500).json({
      success: false,
      message: "Failed to initiate refund",
    });
  }
};