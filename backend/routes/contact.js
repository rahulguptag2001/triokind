const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const { adminAuth } = require('../middleware/auth');

// @route   POST /api/contact
// @desc    Submit contact form
// @access  Public
router.post('/', contactController.submitContact);

// @route   GET /api/contact/messages
// @desc    Get all contact messages
// @access  Private/Admin
router.get('/messages', adminAuth, contactController.getAllMessages);

// @route   PUT /api/contact/messages/:id
// @desc    Update message status
// @access  Private/Admin
router.put('/messages/:id', adminAuth, contactController.updateMessageStatus);

// @route   GET /api/contact/team
// @desc    Get team members
// @access  Public
router.get('/team', contactController.getTeamMembers);

module.exports = router;