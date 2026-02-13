const db = require('../config/database');

// Create new order
exports.createOrder = async (req, res) => {
  const connection = await db.getConnection();
  
  try {
    await connection.beginTransaction();

    const { items, shippingAddress, paymentMethod } = req.body;
    const userId = req.user.id;

    // Calculate total
    let totalAmount = 0;
    for (const item of items) {
      const [products] = await connection.query(
        'SELECT price, stock_quantity FROM products WHERE id = ?',
        [item.productId]
      );

      if (products.length === 0) {
        throw new Error(`Product ${item.productId} not found`);
      }

      if (products[0].stock_quantity < item.quantity) {
        throw new Error(`Insufficient stock for product ${item.productId}`);
      }

      totalAmount += products[0].price * item.quantity;
    }

    // Create or get address
    let addressId;
    if (shippingAddress.id) {
      addressId = shippingAddress.id;
    } else {
      const [addressResult] = await connection.query(
        `INSERT INTO addresses (user_id, address_line1, address_line2, city, state, postal_code, country) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          shippingAddress.address_line1,
          shippingAddress.address_line2,
          shippingAddress.city,
          shippingAddress.state,
          shippingAddress.postal_code,
          shippingAddress.country
        ]
      );
      addressId = addressResult.insertId;
    }

    // Create order
    const [orderResult] = await connection.query(
      `INSERT INTO orders (user_id, address_id, total_amount, payment_method, status) 
       VALUES (?, ?, ?, ?, 'pending')`,
      [userId, addressId, totalAmount, paymentMethod]
    );

    const orderId = orderResult.insertId;

    // Create order items and update stock
    for (const item of items) {
      const [products] = await connection.query(
        'SELECT price FROM products WHERE id = ?',
        [item.productId]
      );

      await connection.query(
        'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES (?, ?, ?, ?)',
        [orderId, item.productId, item.quantity, products[0].price]
      );

      // Update stock
      await connection.query(
        'UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?',
        [item.quantity, item.productId]
      );
    }

    await connection.commit();

    res.status(201).json({
      message: 'Order created successfully',
      orderId,
      totalAmount
    });
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: error.message || 'Server error' });
  } finally {
    connection.release();
  }
};

// Get user orders
exports.getUserOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.*, a.address_line1, a.city, a.state, a.postal_code 
       FROM orders o 
       LEFT JOIN addresses a ON o.address_id = a.id 
       WHERE o.user_id = ? 
       ORDER BY o.order_date DESC`,
      [req.user.id]
    );

    // Get order items for each order
    for (let order of orders) {
      const [items] = await db.query(
        `SELECT oi.*, p.name, p.image_url 
         FROM order_items oi 
         LEFT JOIN products p ON oi.product_id = p.id 
         WHERE oi.order_id = ?`,
        [order.id]
      );
      order.items = items;
    }

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get single order
exports.getOrderById = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.*, a.address_line1, a.address_line2, a.city, a.state, a.postal_code, a.country 
       FROM orders o 
       LEFT JOIN addresses a ON o.address_id = a.id 
       WHERE o.id = ? AND o.user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (orders.length === 0) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const order = orders[0];

    // Get order items
    const [items] = await db.query(
      `SELECT oi.*, p.name, p.image_url, p.manufacturer 
       FROM order_items oi 
       LEFT JOIN products p ON oi.product_id = p.id 
       WHERE oi.order_id = ?`,
      [order.id]
    );

    order.items = items;

    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    await db.query(
      'UPDATE orders SET status = ? WHERE id = ?',
      [status, id]
    );

    res.json({ message: 'Order status updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all orders (admin only)
exports.getAllOrders = async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.*, u.first_name, u.last_name, u.email 
       FROM orders o 
       LEFT JOIN users u ON o.user_id = u.id 
       ORDER BY o.order_date DESC`
    );

    res.json(orders);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};