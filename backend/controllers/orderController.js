// controllers/orderController.js
import pool from "../config/database.js";

// Create new order
export const createOrder = async (req, res) => {
  try {
    const { totalAmount, items, address } = req.body;

    const [result] = await pool.query(
      `INSERT INTO orders (user_id, total_amount, address, status)
       VALUES (?, ?, ?, 'pending')`,
      [req.user.id, totalAmount, address]
    );

    const orderId = result.insertId;

    for (const item of items) {
      await pool.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [orderId, item.product_id, item.quantity, item.price]
      );
    }

    res.status(201).json({
      message: "Order created successfully",
      orderId,
    });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ message: "Server error" });
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