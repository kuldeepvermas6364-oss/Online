const express = require('express');
const bcrypt = require('bcryptjs');
const { generateToken, authenticateToken } = require('../utils/auth');
const { readDb, writeDb, sanitizeUser, getUserById } = require('../data/store');

const router = express.Router();

router.post('/register', async (req, res) => {
  const { name, username, email, password, bio } = req.body;

  if (!name || !username || !email || !password) {
    return res.status(400).json({ error: 'Name, username, email, and password are required.' });
  }

  const db = readDb();
  const exists = db.users.some(
    (user) => user.email.toLowerCase() === email.toLowerCase() || user.username.toLowerCase() === username.toLowerCase()
  );

  if (exists) {
    return res.status(409).json({ error: 'User with this email or username already exists.' });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name,
    username,
    email: email.toLowerCase(),
    password: await bcrypt.hash(password, 10),
    bio: bio || 'New to Online',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80',
    role: 'user',
    followers: [],
    following: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDb(db);

  const token = generateToken(newUser);
  return res.status(201).json({ token, user: sanitizeUser(newUser) });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const db = readDb();
  const user = db.users.find((entry) => entry.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const token = generateToken(user);
  return res.json({ token, user: sanitizeUser(user) });
});

router.get('/me', authenticateToken, (req, res) => {
  const user = getUserById(req.user.sub);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  return res.json({ user: sanitizeUser(user) });
});

module.exports = router;
