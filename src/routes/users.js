const express = require('express');
const { authenticateToken } = require('../utils/auth');
const { readDb, writeDb, sanitizeUser, getUserById } = require('../data/store');

const router = express.Router();

router.get('/', authenticateToken, (req, res) => {
  const db = readDb();
  const users = db.users.map((user) => sanitizeUser(user));
  return res.json(users);
});

router.get('/:id', authenticateToken, (req, res) => {
  const user = getUserById(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  return res.json({ user: sanitizeUser(user) });
});

router.post('/:id/follow', authenticateToken, (req, res) => {
  const db = readDb();
  const targetUser = db.users.find((user) => user.id === req.params.id);
  const currentUser = db.users.find((user) => user.id === req.user.sub);

  if (!targetUser || !currentUser) {
    return res.status(404).json({ error: 'User not found.' });
  }

  if (currentUser.id === targetUser.id) {
    return res.status(400).json({ error: 'You cannot follow yourself.' });
  }

  if (!currentUser.following.includes(targetUser.id)) {
    currentUser.following.push(targetUser.id);
    targetUser.followers.push(currentUser.id);

    db.notifications.push({
      id: `notification-${Date.now()}`,
      userId: targetUser.id,
      type: 'follow',
      text: `${currentUser.name} started following you.`,
      createdAt: new Date().toISOString(),
      read: false
    });
  }

  writeDb(db);
  return res.json({
    currentUser: sanitizeUser(currentUser),
    targetUser: sanitizeUser(targetUser)
  });
});

module.exports = router;
