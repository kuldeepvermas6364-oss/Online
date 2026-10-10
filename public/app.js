const express = require('express');
const { authenticateToken } = require('../utils/auth');
const { readDb, writeDb } = require('../data/store');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  const db = readDb();
  const notifications = db.notifications.filter((item) => item.userId === req.user.sub);
  return res.json(notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

router.post('/:id/read', authenticateToken, (req, res) => {
  const db = readDb();
  const notification = db.notifications.find(
    (item) => item.id === req.params.id && item.userId === req.user.sub
  );

  if (!notification) {
    return res.status(404).json({ error: 'Notification not found.' });
  }

  notification.read = true;
  writeDb(db);
  return res.json({ success: true, notification });
});

module.exports = router;
