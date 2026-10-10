require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const { ensureDb } = require('./src/data/store');
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const postRoutes = require('./src/routes/posts');
const feedRoutes = require('./src/routes/feed');
const messageRoutes = require('./src/routes/messages');
const notificationRoutes = require('./src/routes/notifications');
const { authenticateToken } = require('./src/utils/auth');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Online social media API is running.' });
});

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/posts', postRoutes);
app.use('/api/v1/feed', feedRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/notifications', notificationRoutes);

app.get('/api/v1/me', authenticateToken, (req, res) => {
  const { getUserById } = require('./src/data/store');
  const user = getUserById(req.user.sub);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  res.json({ user: { ...user, password: undefined } });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

async function bootstrap() {
  await ensureDb();
  app.listen(PORT, () => {
    console.log(`Online social media app running at http://localhost:${PORT}`);
  });
}

bootstrap();
