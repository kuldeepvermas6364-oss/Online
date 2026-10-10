const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const { env } = require('./src/config/env');
const { ensureDb } = require('./src/data/store');
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const postRoutes = require('./src/routes/posts');
const feedRoutes = require('./src/routes/feed');
const messageRoutes = require('./src/routes/messages');
const notificationRoutes = require('./src/routes/notifications');
const { authenticateToken } = require('./src/utils/auth');
const { notFoundHandler } = require('./src/middleware/notFound');
const { errorHandler } = require('./src/middleware/errorHandler');

const app = express();
const PORT = env.PORT || 3000;

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(compression());
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests from this IP. Please try again later.' }
  })
);
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

app.use(notFoundHandler);
app.use(errorHandler);

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
