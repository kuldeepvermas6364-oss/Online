const express = require('express');
const { authenticateToken } = require('../utils/auth');
const { readDb, writeDb } = require('../data/store');

const router = express.Router();

router.get('/:otherUserId', authenticateToken, (req, res) => {
  const db = readDb();
  const currentUserId = req.user.sub;
  const otherUserId = req.params.otherUserId;

  const messages = db.messages.filter((message) => {
    return (
      (message.fromUserId === currentUserId && message.toUserId === otherUserId) ||
      (message.fromUserId === otherUserId && message.toUserId === currentUserId)
    );
  });

  return res.json(messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
});

router.post('/:otherUserId', authenticateToken, (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Message text is required.' });
  }

  const db = readDb();
  const newMessage = {
    id: `message-${Date.now()}`,
    fromUserId: req.user.sub,
    toUserId: req.params.otherUserId,
    text: text.trim(),
    createdAt: new Date().toISOString(),
    read: false
  };

  db.messages.push(newMessage);
  writeDb(db);
  return res.status(201).json(newMessage);
});

module.exports = router;
