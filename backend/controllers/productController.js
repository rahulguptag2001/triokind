// controllers/productController.js - Product Management Logic
import pool from "../config/database.js";

// Get all products with optional filters
export const getAllProducts = async (req, res) => {
  try {
    const { category, search, featured } = req.query;

    let query = `
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (category) {
      query += " AND p.category_id = ?";
      params.push(category);
    }

    if (search) {
      query += " AND (p.name LIKE ? OR p.description LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    if (featured === "true") {
      query += " AND p.featured = true";
    }

    query += " ORDER BY p.created_at DESC";

    const [products] = await pool.query(query, params);
    res.json(products);
  } catch (error) {
    console.error("Get all products error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get single product by ID
export const getProductById = async (req, res) => {
  try {
    const [products] = await pool.query(
      `
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
      `,
      [req.params.id]
    );

    if (products.length === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(products[0]);
  } catch (error) {
    console.error("Get product by ID error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const [categories] = await pool.query(
      "SELECT * FROM categories ORDER BY name"
    );
    res.json(categories);
  } catch (error) {
    console.error("Get categories error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get products by category
export const getProductsByCategory = async (req, res) => {
  try {
    const [products] = await pool.query(
      `
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.category_id = ?
      ORDER BY p.name
      `,
      [req.params.categoryId]
    );

    res.json(products);
  } catch (error) {
    console.error("Get products by category error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get featured products
export const getFeaturedProducts = async (req, res) => {
  try {
    const [products] = await pool.query(
      `
      SELECT p.*, c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.featured = true
      ORDER BY p.created_at DESC
      LIMIT 6
      `
    );

    res.json(products);
  } catch (error) {
    console.error("Get featured products error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Create product (admin only)
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      category_id,
      stock_quantity,
      manufacturer,
      dosage,
      prescription_required,
      featured,
    } = req.body;

    const [result] = await pool.query(
      `
      INSERT INTO products
      (name, description, price, category_id, stock_quantity, manufacturer, dosage, prescription_required, featured)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `,
      [
        name,
        description,
        price,
        category_id,
        stock_quantity,
        manufacturer,
        dosage,
        prescription_required,
        featured,
      ]
    );

    res.status(201).json({
      message: "Product created successfully",
      productId: result.insertId,
    });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update product (admin only)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No fields to update" });
    }

    const fields = Object.keys(updates)
      .map((key) => `${key} = ?`)
      .join(", ");
    const values = [...Object.values(updates), id];

    await pool.query(
      `UPDATE products SET ${fields} WHERE id = ?`,
      values
    );

    res.json({ message: "Product updated successfully" });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete product (admin only)
export const deleteProduct = async (req, res) => {
  try {
    await pool.query("DELETE FROM products WHERE id = ?", [
      req.params.id,
    ]);

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ message: "Server error" });
  }
};