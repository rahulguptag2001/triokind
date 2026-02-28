// controllers/orderController.js
import pool from "../config/database.js";

// Create new order
import pool from "../config/database.js";

export const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { items, shippingAddress, paymentMethod, totalAmount } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    // 1️⃣ Create order
    const [orderResult] = await pool.query(
      `INSERT INTO orders 
       (user_id, total_amount, address, city, state, pincode, country, payment_method, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        userId,
        totalAmount,
        shippingAddress.address_line1,
        shippingAddress.city,
        shippingAddress.state,
        shippingAddress.postal_code,
        shippingAddress.country,
        paymentMethod
      ]
    );

    const orderId = orderResult.insertId;

    // 2️⃣ Insert order items
    for (const item of items) {
      await pool.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [
          orderId,
          item.productId,   // ✅ FIXED
          item.quantity,
          item.price        // ✅ MUST COME FROM FRONTEND
        ]
      );
    }

    res.status(201).json({
      success: true,
      orderId
    });

  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Order creation failed" });
  }
};
// Get orders for logged-in user
export const getUserOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC`,
      [req.user.id]
    );

    res.json(orders);
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single order by ID
export const getOrderById = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT * FROM orders WHERE id = ?`,
      [req.params.id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(orders[0]);
  } catch (error) {
    console.error("Get order by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update order status (Admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;

    await pool.query(
      `UPDATE orders SET status = ? WHERE id = ?`,
      [status, req.params.id]
    );

    res.json({ message: "Order status updated successfully" });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all orders (Admin)
export const getAllOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT * FROM orders ORDER BY created_at DESC`
    );

    res.json(orders);
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({ message: "Server error" });
  }
};