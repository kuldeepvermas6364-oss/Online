const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'db.json');

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...safeUser } = user;
  return safeUser;
}

function getUserById(userId) {
  const db = readDb();
  return db.users.find((user) => user.id === userId) || null;
}

function readDb() {
  ensureDir();
  if (!fs.existsSync(DATA_FILE)) {
    const initial = {
      users: [],
      posts: [],
      messages: [],
      notifications: []
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
  }

  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
}

function writeDb(data) {
  ensureDir();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

async function seedDefaultUsers() {
  const db = readDb();
  if (db.users.length > 0) return db;

  const users = [
    {
      id: 'user-1',
      name: 'Aisha Sharma',
      username: 'aisha',
      email: 'aisha@online.app',
      password: await bcrypt.hash('Password123!', 10),
      bio: 'Product designer and early riser',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80',
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
      password: await bcrypt.hash('Password123!', 10),
      bio: 'Frontend engineer building better experiences',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80',
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
      password: await bcrypt.hash('Password123!', 10),
      bio: 'Food storyteller and community builder',
      avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=500&q=80',
      role: 'admin',
      followers: [],
      following: ['user-1'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  const posts = [
    {
      id: 'post-1',
      userId: 'user-1',
      content: 'Morning coffee, design sprint, and a peaceful start to the day. What does your ideal morning look like?',
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
        { id: 'comment-3', userId: 'user-1', text: 'Clean and efficient. Great work.', createdAt: new Date().toISOString() }
      ],
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  const messages = [
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
  ];

  const notifications = [
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
  ];

  const seeded = { users, posts, messages, notifications };
  writeDb(seeded);
  return seeded;
}

async function ensureDb() {
  const db = readDb();
  if (db.users.length === 0) {
    await seedDefaultUsers();
  }
  return readDb();
}

module.exports = {
  ensureDb,
  readDb,
  writeDb,
  getUserById,
  sanitizeUser
};
