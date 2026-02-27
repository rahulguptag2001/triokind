// routes/products.js
import express from "express";

import {
  getAllProducts,
  getFeaturedProducts,
  getCategories,
  getProductsByCategory,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";

import { auth, adminAuth } from "../middleware/auth.js";

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with optional filters
// @access  Public
router.get("/", getAllProducts);

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get("/featured", getFeaturedProducts);

// @route   GET /api/products/categories
// @desc    Get all categories
// @access  Public
router.get("/categories", getCategories);

// @route   GET /api/products/category/:categoryId
// @desc    Get products by category
// @access  Public
router.get("/category/:categoryId", getProductsByCategory);

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get("/:id", getProductById);

// @route   POST /api/products
// @desc    Create new product
// @access  Private/Admin
router.post("/", adminAuth, createProduct);

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private/Admin
router.put("/:id", adminAuth, updateProduct);

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private/Admin
router.delete("/:id", adminAuth, deleteProduct);

export default router;