const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'online-social-media-secret';
const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

function ensureDataFile() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  if (!fs.existsSync(DATA_FILE)) {
    const initial = {
      users: [
        {
          id: 'user-1',
          name: 'Aisha Sharma',
          username: 'aisha',
          email: 'aisha@online.app',
          password: '',
          bio: 'Product designer & early riser',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
          role: 'user',
          followers: ['user-2'],
          following: ['user-2'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'user-2',
          name: 'Rahul Verma',
          username: 'rahul',
          email: 'rahul@online.app',
          password: '',
          bio: 'Frontend engineer building better experiences',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
          role: 'user',
          followers: ['user-1'],
          following: ['user-1'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'user-3',
          name: 'Neha Gupta',
          username: 'neha',
          email: 'neha@online.app',
          password: '',
          bio: 'Food storyteller and community builder',
          avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=400&q=80',
          role: 'admin',
          followers: [],
          following: ['user-1'],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      posts: [
        {
          id: 'post-1',
          userId: 'user-1',
          content: 'Morning coffee, design sprint, and a peaceful start to the day. What does your perfect morning look like?',
          image: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80',
          likes: ['user-2', 'user-3'],
          comments: [
            { id: 'comment-1', userId: 'user-2', text: 'This looks incredible!', createdAt: new Date().toISOString() },
            { id: 'comment-2', userId: 'user-3', text: 'Love the vibe.', createdAt: new Date().toISOString() }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'post-2',
          userId: 'user-2',
          content: 'Built a cleaner UI today. Small details make the biggest difference when users interact with a product.',
          image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
          likes: ['user-1'],
          comments: [
            { id: 'comment-3', userId: 'user-1', text: 'Clean and efficient—great work.', createdAt: new Date().toISOString() }
          ],
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          updatedAt: new Date(Date.now() - 3600000).toISOString()
        }
      ],
      messages: [
        {
          id: 'message-1',
          fromUserId: 'user-2',
          toUserId: 'user-1',
          text: 'Can you review the mockup before noon?',
          createdAt: new Date().toISOString(),
          read: true
        },
        {
          id: 'message-2',
          fromUserId: 'user-1',
          toUserId: 'user-2',
          text: 'Absolutely. I will send my notes shortly.',
          createdAt: new Date(Date.now() - 300000).toISOString(),
          read: true
        }
      ],
      notifications: [
        {
          id: 'notification-1',
          userId: 'user-1',
          type: 'like',
          text: 'Rahul liked your recent post.',
          createdAt: new Date().toISOString(),
          read: false
        },
        {
          id: 'notification-2',
          userId: 'user-2',
          type: 'follow',
          text: 'Aisha followed you.',
          createdAt: new Date(Date.now() - 600000).toISOString(),
          read: false
        }
      ]
    };

    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
  }
}

function readDb() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function writeDb(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

async function seedPasswordsIfNeeded() {
  const db = readDb();
  let changed = false;

  for (const user of db.users) {
    if (!user.password) {
      user.password = await bcrypt.hash('Password123!', 10);
      changed = true;
    }
  }

  if (changed) writeDb(db);
}

function sanitizeUser(user) {
  const { password, ...safeUser } = user;
  return safeUser;
}

function generateToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      username: user.username
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Authentication token missing.' });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

function getUserById(db, userId) {
  return db.users.find((user) => user.id === userId);
}

function buildPostObject(db, post) {
  const author = getUserById(db, post.userId);
  return {
    ...post,
    author: author ? sanitizeUser(author) : null,
    likesCount: post.likes.length,
    commentsCount: post.comments.length
  };
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Online social media backend is running.' });
});

app.post('/api/v1/auth/register', async (req, res) => {
  const { name, username, email, password, bio } = req.body;

  if (!name || !username || !email || !password) {
    return res.status(400).json({ error: 'Name, username, email, and password are required.' });
  }

  const db = readDb();
  const exists = db.users.some(
    (user) => user.email.toLowerCase() === email.toLowerCase() || user.username.toLowerCase() === username.toLowerCase()
  );

  if (exists) {
    return res.status(409).json({ error: 'User with that email or username already exists.' });
  }

  const newUser = {
    id: `user-${Date.now()}`,
    name,
    username,
    email: email.toLowerCase(),
    password: await bcrypt.hash(password, 10),
    bio: bio || 'New to Online',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    role: 'user',
    followers: [],
    following: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.users.push(newUser);
  writeDb(db);

  const token = generateToken(newUser);
  res.status(201).json({
    token,
    user: sanitizeUser(newUser)
  });
});

app.post('/api/v1/auth/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const db = readDb();
  const user = db.users.find((entry) => entry.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const token = generateToken(user);
  res.json({
    token,
    user: sanitizeUser(user)
  });
});

app.get('/api/v1/auth/me', authenticateToken, (req, res) => {
  const db = readDb();
  const user = getUserById(db, req.user.sub);

  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  res.json({ user: sanitizeUser(user) });
});

app.get('/api/v1/users', authenticateToken, (req, res) => {
  const db = readDb();
  res.json(db.users.map(sanitizeUser));
});

app.get('/api/v1/users/:id', authenticateToken, (req, res) => {
  const db = readDb();
  const user = getUserById(db, req.params.id);

  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  res.json({ user: sanitizeUser(user) });
});

app.post('/api/v1/users/:id/follow', authenticateToken, (req, res) => {
  const db = readDb();
  const targetUser = getUserById(db, req.params.id);
  const currentUser = getUserById(db, req.user.sub);

  if (!targetUser || !currentUser) {
    return res.status(404).json({ error: 'User not found.' });
  }

  if (currentUser.id === targetUser.id) {
    return res.status(400).json({ error: 'You cannot follow yourself.' });
  }

  if (!currentUser.following.includes(targetUser.id)) {
    currentUser.following.push(targetUser.id);
    targetUser.followers.push(currentUser.id);
    currentUser.updatedAt = new Date().toISOString();
    targetUser.updatedAt = new Date().toISOString();

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
  res.json({
    user: sanitizeUser(currentUser),
    targetUser: sanitizeUser(targetUser)
  });
});

app.get('/api/v1/feed', authenticateToken, (req, res) => {
  const db = readDb();
  const currentUser = getUserById(db, req.user.sub);
  const followedUserIds = new Set(currentUser.following.concat(currentUser.id));

  const posts = db.posts
    .filter((post) => followedUserIds.has(post.userId))
    .map((post) => buildPostObject(db, post))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(posts);
});

app.get('/api/v1/posts/:id', authenticateToken, (req, res) => {
  const db = readDb();
  const post = db.posts.find((entry) => entry.id === req.params.id);

  if (!post) {
    return res.status(404).json({ error: 'Post not found.' });
  }

  res.json(buildPostObject(db, post));
});

app.post('/api/v1/posts', authenticateToken, (req, res) => {
  const { content, image } = req.body;

  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Post content is required.' });
  }

  const db = readDb();
  const post = {
    id: `post-${Date.now()}`,
    userId: req.user.sub,
    content: content.trim(),
    image: image || '',
    likes: [],
    comments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.posts.unshift(post);
  writeDb(db);
  res.status(201).json(buildPostObject(db, post));
});

app.post('/api/v1/posts/:id/like', authenticateToken, (req, res) => {
  const db = readDb();
  const post = db.posts.find((entry) => entry.id === req.params.id);

  if (!post) {
    return res.status(404).json({ error: 'Post not found.' });
  }

  const userId = req.user.sub;
  if (!post.likes.includes(userId)) {
    post.likes.push(userId);
    post.updatedAt = new Date().toISOString();

    db.notifications.push({
      id: `notification-${Date.now()}`,
      userId: post.userId,
      type: 'like',
      text: `${getUserById(db, userId).name} liked your post.`,
      createdAt: new Date().toISOString(),
      read: false
    });
  }

  writeDb(db);
  res.json({ success: true, likesCount: post.likes.length });
});

app.post('/api/v1/posts/:id/comment', authenticateToken, (req, res) => {
  const { text } = req.body;

  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Comment text is required.' });
  }

  const db = readDb();
  const post = db.posts.find((entry) => entry.id === req.params.id);

  if (!post) {
    return res.status(404).json({ error: 'Post not found.' });
  }

  const comment = {
    id: `comment-${Date.now()}`,
    userId: req.user.sub,
    text: text.trim(),
    createdAt: new Date().toISOString()
  };

  post.comments.push(comment);
  post.updatedAt = new Date().toISOString();

  db.notifications.push({
    id: `notification-${Date.now()}`,
    userId: post.userId,
    type: 'comment',
    text: `${getUserById(db, req.user.sub).name} commented on your post.`,
    createdAt: new Date().toISOString(),
    read: false
  });

  writeDb(db);
  res.status(201).json(comment);
});

app.get('/api/v1/messages/:otherUserId', authenticateToken, (req, res) => {
  const db = readDb();
  const currentUserId = req.user.sub;
  const otherUserId = req.params.otherUserId;

  const messages = db.messages.filter((message) => {
    const matchesBetweenUsers =
      (message.fromUserId === currentUserId && message.toUserId === otherUserId) ||
      (message.fromUserId === otherUserId && message.toUserId === currentUserId);

    return matchesBetweenUsers;
  });

  res.json(messages.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)));
});

app.post('/api/v1/messages/:otherUserId', authenticateToken, (req, res) => {
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
  res.status(201).json(newMessage);
});

app.get('/api/v1/notifications', authenticateToken, (req, res) => {
  const db = readDb();
  const notifications = db.notifications.filter((item) => item.userId === req.user.sub);
  res.json(notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
});

app.post('/api/v1/notifications/:id/read', authenticateToken, (req, res) => {
  const db = readDb();
  const notification = db.notifications.find((item) => item.id === req.params.id && item.userId === req.user.sub);

  if (!notification) {
    return res.status(404).json({ error: 'Notification not found.' });
  }

  notification.read = true;
  writeDb(db);
  res.json({ success: true, notification });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

async function bootstrap() {
  await seedPasswordsIfNeeded();
  app.listen(PORT, () => {
    console.log(`Online social media app running on http://localhost:${PORT}`);
  });
}

bootstrap();
