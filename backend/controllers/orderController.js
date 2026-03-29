// controllers/orderController.js
import pool from "../config/database.js";
import { sendOrderNotification } from "../utils/emailService.js";

export const createOrder = async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const userId = req.user.id;
    const { items, shippingAddress, totalAmount } = req.body;

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

    if (!totalAmount || isNaN(Number(totalAmount)) || Number(totalAmount) <= 0) {
      return res.status(400).json({ success: false, message: "Valid total amount is required" });
    }

    await connection.beginTransaction();

    // Fetch user for email
    const [users] = await connection.query(
      "SELECT first_name, last_name, email FROM users WHERE id = ?",
      [userId]
    );
    const user = users[0];

    const [addressResult] = await connection.query(
      `INSERT INTO addresses (user_id, address_line1, address_line2, city, state, postal_code, country)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        shippingAddress.address_line1,
        shippingAddress.address_line2 || null,
        shippingAddress.city,
        shippingAddress.state,
        shippingAddress.postal_code,
        shippingAddress.country || "India",
      ]
    );

    const addressId = addressResult.insertId;

    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, address_id, total_amount, payment_method, payment_status, status)
       VALUES (?, ?, ?, 'cod', 'pending', 'pending')`,
      [userId, addressId, totalAmount]
    );

    const orderId = orderResult.insertId;
    const emailItems = [];

    for (const item of items) {
      const productId = item.productId || item.id;
      const quantity = parseInt(item.quantity, 10);

      if (!productId) throw new Error("Missing productId in cart item");
      if (!quantity || quantity <= 0) throw new Error(`Invalid quantity for product ${productId}`);

      const [products] = await connection.query(
        "SELECT name, price, stock_quantity FROM products WHERE id = ?",
        [productId]
      );

      if (products.length === 0) throw new Error(`Product ${productId} not found`);
      if (products[0].stock_quantity < quantity) throw new Error(`Insufficient stock for product ${productId}`);

      await connection.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)`,
        [orderId, productId, quantity, products[0].price]
      );

      await connection.query(
        `UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?`,
        [quantity, productId]
      );

      emailItems.push({ name: products[0].name, quantity, price: products[0].price });
    }

    await connection.commit();

    // Send email — non-blocking, never crashes the order
    sendOrderNotification({
      orderId,
      customerName: `${user.first_name} ${user.last_name}`,
      customerEmail: user.email,
      shippingAddress,
      items: emailItems,
      totalAmount,
      paymentMethod: "cod",
      paymentStatus: "pending",
      timestamp: new Date(),
    });

    res.status(201).json({ success: true, message: "Order created successfully", orderId });
  } catch (error) {
    await connection.rollback();
    console.error("Create order error:", error);
    res.status(500).json({ success: false, message: error.message || "Order creation failed" });
  } finally {
    connection.release();
  }
};

export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;
    const [orders] = await pool.query(
      `SELECT o.*, (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) AS item_count
       FROM orders o WHERE o.user_id = ? ORDER BY o.order_date DESC`,
      [userId]
    );
    res.json({ success: true, orders });
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;
    const [orders] = await pool.query(
      `SELECT * FROM orders WHERE id = ? AND user_id = ?`,
      [orderId, userId]
    );
    if (orders.length === 0) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    const [items] = await pool.query(
      `SELECT oi.*, p.name AS product_name, p.image_url
       FROM order_items oi JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [orderId]
    );
    res.json({ success: true, order: { ...orders[0], items } });
  } catch (error) {
    console.error("Get order by ID error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch order" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;
    const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }
    const [result] = await pool.query("UPDATE orders SET status = ? WHERE id = ?", [status, orderId]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    res.json({ success: true, message: "Order status updated successfully" });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ success: false, message: "Failed to update order status" });
  }
};

export const getAllOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT o.*, u.first_name, u.last_name, u.email AS customer_email,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) AS item_count
       FROM orders o LEFT JOIN users u ON o.user_id = u.id ORDER BY o.order_date DESC`
    );
    res.json({ success: true, orders });
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders" });
  }
};

export default { createOrder, getUserOrders, getOrderById, updateOrderStatus, getAllOrders };