// routes/upload.js - Image Upload Routes with Cloudinary
import express from 'express';
import { auth } from '../middleware/auth.js';
import {
  uploadProductImage,
  handleUpload,
  uploadMultipleImages,
  handleMultipleUpload,
  deleteImage
} from '../controllers/uploadController.js';

const router = express.Router();

// Single image upload
router.post(
  '/product-image',
  auth,
  uploadProductImage,
  handleUpload
);

// Multiple images upload
router.post(
  '/product-images',
  auth,
  uploadMultipleImages,
  handleMultipleUpload
);

// Delete image
router.delete(
  '/image/:publicId',
  auth,
  deleteImage
);

export default router;