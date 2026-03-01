// controllers/orderController.js - FIXED VERSION
import pool from "../config/database.js";

/**
 * CREATE ORDER (COD + Razorpay)
 */
export const createOrder = async (req, res) => {
  const connection = await pool.getConnection();
  
  try {
    const userId = req.user.id;
    const { items, shippingAddress, paymentMethod, totalAmount } = req.body;

    console.log('📦 Creating order for user:', userId);
    console.log('📦 Items:', items);
    console.log('📦 Shipping:', shippingAddress);

    // Validation
    if (!items || items.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "Cart is empty" 
      });
    }

    if (!shippingAddress || !shippingAddress.address_line1) {
      return res.status(400).json({ 
        success: false,
        message: "Shipping address is required" 
      });
    }

    // Start transaction
    await connection.beginTransaction();

    // 1️⃣ Create order
    const [orderResult] = await connection.query(
      `INSERT INTO orders
       (user_id, total_amount, address, city, state, pincode, country, payment_method, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
      [
        userId,
        totalAmount,
        shippingAddress.address_line1,
        shippingAddress.city || '',
        shippingAddress.state || '',
        shippingAddress.postal_code || '',
        shippingAddress.country || 'India',
        paymentMethod || 'COD'
      ]
    );

    const orderId = orderResult.insertId;
    console.log('✅ Order created with ID:', orderId);

    // 2️⃣ Insert order items
    for (const item of items) {
      if (!item.productId || !item.price || !item.quantity) {
        throw new Error(`Invalid product data: ${JSON.stringify(item)}`);
      }

      await connection.query(
        `INSERT INTO order_items (order_id, product_id, quantity, price)
         VALUES (?, ?, ?, ?)`,
        [
          orderId,
          item.productId,
          item.quantity,
          item.price
        ]
      );
    }

    console.log('✅ Order items inserted');

    // Commit transaction
    await connection.commit();

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      orderId,
      orderDetails: {
        id: orderId,
        totalAmount,
        paymentMethod,
        status: 'pending'
      }
    });

  } catch (error) {
    // Rollback on error
    await connection.rollback();
    
    console.error("❌ Create order error:", error);
    console.error("❌ Error details:", error.message);
    
    res.status(500).json({ 
      success: false,
      message: "Order creation failed",
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    connection.release();
  }
};

/**
 * GET USER ORDERS
 */
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const [orders] = await pool.query(
      `SELECT 
        o.*,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
       FROM orders o 
       WHERE o.user_id = ? 
       ORDER BY o.created_at DESC`,
      [userId]
    );

    console.log(`✅ Found ${orders.length} orders for user ${userId}`);

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error("❌ Get user orders error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch orders" 
    });
  }
};

/**
 * GET ORDER BY ID (with items)
 */
export const getOrderById = async (req, res) => {
  try {
    const orderId = req.params.id;
    const userId = req.user.id;

    // Get order
    const [orders] = await pool.query(
      `SELECT * FROM orders WHERE id = ? AND user_id = ?`,
      [orderId, userId]
    );

    if (orders.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Order not found" 
      });
    }

    // Get order items with product details
    const [items] = await pool.query(
      `SELECT 
        oi.*,
        p.name as product_name,
        p.image_url
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    res.json({
      success: true,
      order: {
        ...orders[0],
        items
      }
    });
  } catch (error) {
    console.error("❌ Get order by ID error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch order" 
    });
  }
};

/**
 * UPDATE ORDER STATUS (Admin only)
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const orderId = req.params.id;

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false,
        message: "Invalid status" 
      });
    }

    const [result] = await pool.query(
      `UPDATE orders SET status = ? WHERE id = ?`,
      [status, orderId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        message: "Order not found" 
      });
    }

    console.log(`✅ Order ${orderId} status updated to ${status}`);

    res.json({ 
      success: true,
      message: "Order status updated successfully" 
    });
  } catch (error) {
    console.error("❌ Update order status error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to update order status" 
    });
  }
};

/**
 * GET ALL ORDERS (Admin only)
 */
export const getAllOrders = async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT 
        o.*,
        u.name as customer_name,
        u.email as customer_email,
        (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) as item_count
       FROM orders o
       LEFT JOIN users u ON o.user_id = u.id
       ORDER BY o.created_at DESC`
    );

    console.log(`✅ Retrieved ${orders.length} orders (admin)`);

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error("❌ Get all orders error:", error);
    res.status(500).json({ 
      success: false,
      message: "Failed to fetch orders" 
    });
  }
};

export default {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  getAllOrders
};