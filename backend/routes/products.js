const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { auth, adminAuth } = require('../middleware/auth');

// @route   GET /api/products
// @desc    Get all products with optional filters
// @access  Public
router.get('/', productController.getAllProducts);

// @route   GET /api/products/featured
// @desc    Get featured products
// @access  Public
router.get('/featured', productController.getFeaturedProducts);

// @route   GET /api/products/categories
// @desc    Get all categories
// @access  Public
router.get('/categories', productController.getCategories);

// @route   GET /api/products/category/:categoryId
// @desc    Get products by category
// @access  Public
router.get('/category/:categoryId', productController.getProductsByCategory);

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', productController.getProductById);

// @route   POST /api/products
// @desc    Create new product
// @access  Private/Admin
router.post('/', adminAuth, productController.createProduct);

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private/Admin
router.put('/:id', adminAuth, productController.updateProduct);

// @route   DELETE /api/products/:id
// @desc    Delete product
// @access  Private/Admin
router.delete('/:id', adminAuth, productController.deleteProduct);

module.exports = router;