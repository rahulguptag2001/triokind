// controllers/contactController.js
import pool from "../config/database.js";

// Submit contact form
export const submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !message) {
      return res.status(400).json({
        message: "Name, email, and message are required",
      });
    }

    await pool.query(
      `
      INSERT INTO contact_messages 
      (name, email, phone, subject, message)
      VALUES (?, ?, ?, ?, ?)
      `,
      [name, email, phone || null, subject || null, message]
    );

    res.status(201).json({
      message: "Thank you for contacting us! We will get back to you soon.",
    });
  } catch (error) {
    console.error("Submit contact error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all contact messages (admin only)
export const getAllMessages = async (req, res) => {
  try {
    const [messages] = await pool.query(
      "SELECT * FROM contact_messages ORDER BY created_at DESC"
    );

    res.json(messages);
  } catch (error) {
    console.error("Get all messages error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update message status (admin only)
export const updateMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { id } = req.params;

    await pool.query(
      "UPDATE contact_messages SET status = ? WHERE id = ?",
      [status, id]
    );

    res.json({ message: "Message status updated successfully" });
  } catch (error) {
    console.error("Update message status error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get team members
export const getTeamMembers = async (req, res) => {
  try {
    const [members] = await pool.query(
      "SELECT * FROM team_members ORDER BY display_order"
    );

    res.json(members);
  } catch (error) {
    console.error("Get team members error:", error);
    res.status(500).json({ message: "Server error" });
  }
};