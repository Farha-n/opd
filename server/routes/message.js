const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const { protect } = require('../middleware/authMiddleware');

// Get all messages between logged-in user and another user
router.get('/:userId', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const otherUserId = req.params.userId;
    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId },
      ],
    }).sort({ createdAt: 1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Send a message
router.post('/', protect, async (req, res) => {
  try {
    const { receiver, text } = req.body;
    const sender = req.user._id;
    const message = await Message.create({ sender, receiver, text });
    res.status(201).json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get recent conversation partners
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    // Find all messages where user is sender or receiver
    const messages = await Message.find({
      $or: [
        { sender: userId },
        { receiver: userId },
      ],
    }).sort({ createdAt: -1 });
    // Get unique userIds of conversation partners
    const partners = new Map();
    messages.forEach(msg => {
      const otherId = msg.sender.equals(userId) ? msg.receiver.toString() : msg.sender.toString();
      if (!partners.has(otherId)) partners.set(otherId, msg.createdAt);
    });
    // Fetch user info for each partner
    const users = await Promise.all(
      Array.from(partners.keys()).map(async id => {
        const user = await require('../models/User').findById(id).select('name email');
        return user ? { _id: user._id, name: user.name, email: user.email, lastMessage: partners.get(id) } : null;
      })
    );
    res.json(users.filter(Boolean));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 