// routes/contact.js
import express from "express";

import {
  submitContact,
  getAllMessages,
  updateMessageStatus,
  getTeamMembers,
} from "../controllers/contactController.js";

import { adminAuth } from "../middleware/auth.js";

const router = express.Router();

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post("/", submitContact);

// @route   GET /api/contact/messages
// @desc    Get all contact messages
// @access  Private/Admin
router.get("/messages", adminAuth, getAllMessages);

// @route   PUT /api/contact/messages/:id
// @desc    Update message status
// @access  Private/Admin
router.put("/messages/:id", adminAuth, updateMessageStatus);

// @route   GET /api/contact/team
// @desc    Get team members
// @access  Public
router.get("/team", getTeamMembers);

export default router;