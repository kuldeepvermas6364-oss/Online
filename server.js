const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const users = [
  {
    id: 'u1',
    name: 'Aisha Sharma',
    username: 'aisha',
    email: 'aisha@example.com',
    bio: 'Product designer • coffee lover • traveler',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    followers: ['u2', 'u3'],
    following: ['u2']
  },
  {
    id: 'u2',
    name: 'Rahul Verma',
    username: 'rahul',
    email: 'rahul@example.com',
    bio: 'Frontend engineer and tech enthusiast',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
    followers: ['u1', 'u3'],
    following: ['u1']
  },
  {
    id: 'u3',
    name: 'Neha Gupta',
    username: 'neha',
    email: 'neha@example.com',
    bio: 'Food blogger and lifestyle storyteller',
    avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=200&q=80',
    followers: ['u1'],
    following: ['u1', 'u2']
  }
];

const posts = [
  {
    id: 'p1',
    userId: 'u1',
    content: 'Morning walk and coffee before the sprint. Nothing beats a calm start to the day.',
    image: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=900&q=80',
    likes: ['u2', 'u3'],
    comments: [
      { id: 'c1', userId: 'u2', text: 'That view is beautiful!' },
      { id: 'c2', userId: 'u3', text: 'Perfect morning vibes.' }
    ],
    createdAt: new Date().toISOString()
  },
  {
    id: 'p2',
    userId: 'u2',
    content: 'Built a cool UI component today. The simplest things often feel the best.',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
    likes: ['u1'],
    comments: [
      { id: 'c3', userId: 'u1', text: 'Looks clean and smooth.' }
    ],
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: 'p3',
    userId: 'u3',
    content: 'Trying a new recipe tonight. Cooking is my stress relief and creativity outlet.',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=900&q=80',
    likes: ['u1', 'u2', 'u3'],
    comments: [],
    createdAt: new Date(Date.now() - 7200000).toISOString()
  }
];

const messages = {
  u1: [
    { id: 'm1', from: 'u2', text: 'Can you review the mockup before noon?', createdAt: new Date().toISOString() },
    { id: 'm2', from: 'u1', text: 'Absolutely, send it over.', createdAt: new Date(Date.now() - 300000).toISOString() }
  ],
  u2: [
    { id: 'm1', from: 'u2', text: 'Can you review the mockup before noon?', createdAt: new Date().toISOString() },
    { id: 'm2', from: 'u1', text: 'Absolutely, send it over.', createdAt: new Date(Date.now() - 300000).toISOString() }
  ]
};

const notifications = [
  { id: 'n1', userId: 'u1', type: 'like', text: 'Rahul liked your post', createdAt: new Date().toISOString() },
  { id: 'n2', userId: 'u2', type: 'follow', text: 'Aisha started following you', createdAt: new Date(Date.now() - 600000).toISOString() },
  { id: 'n3', userId: 'u3', type: 'comment', text: 'Neha commented on your story', createdAt: new Date(Date.now() - 1200000).toISOString() }
];

const findUserById = (id) => users.find((user) => user.id === id);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Social media app is running' });
});

app.get('/api/users', (req, res) => {
  res.json(users);
});

app.post('/api/register', (req, res) => {
  const { name, username, email, bio } = req.body;

  if (!name || !username || !email) {
    return res.status(400).json({ error: 'Name, username and email are required' });
  }

  const existing = users.find((user) => user.email === email || user.username === username);
  if (existing) {
    return res.status(409).json({ error: 'User already exists' });
  }

  const newUser = {
    id: `u${Date.now()}`,
    name,
    username,
    email,
    bio: bio || 'New to Online',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80',
    followers: [],
    following: []
  };

  users.push(newUser);
  res.status(201).json({ user: newUser, message: 'User created successfully' });
});

app.post('/api/login', (req, res) => {
  const { email } = req.body;
  const user = users.find((entry) => entry.email === email);

  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  res.json({ user });
});

app.get('/api/feed', (req, res) => {
  const feed = posts
    .slice()
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((post) => ({
      ...post,
      author: findUserById(post.userId),
      comments: post.comments.map((comment) => ({
        ...comment,
        author: findUserById(comment.userId)
      }))
    }));

  res.json(feed);
});

app.post('/api/posts', (req, res) => {
  const { userId, content, image } = req.body;

  if (!userId || !content) {
    return res.status(400).json({ error: 'userId and content are required' });
  }

  const newPost = {
    id: `p${Date.now()}`,
    userId,
    content,
    image: image || '',
    likes: [],
    comments: [],
    createdAt: new Date().toISOString()
  };

  posts.unshift(newPost);
  res.status(201).json({ post: { ...newPost, author: findUserById(userId) } });
});

app.post('/api/posts/:id/like', (req, res) => {
  const { userId } = req.body;
  const post = posts.find((entry) => entry.id === req.params.id);

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  if (!post.likes.includes(userId)) {
    post.likes.push(userId);
  }

  res.json({ success: true, likes: post.likes.length });
});

app.post('/api/posts/:id/comment', (req, res) => {
  const { userId, text } = req.body;
  const post = posts.find((entry) => entry.id === req.params.id);

  if (!post) {
    return res.status(404).json({ error: 'Post not found' });
  }

  const comment = {
    id: `c${Date.now()}`,
    userId,
    text
  };

  post.comments.push(comment);
  res.status(201).json({ comment: { ...comment, author: findUserById(userId) } });
});

app.post('/api/users/:id/follow', (req, res) => {
  const { followerId } = req.body;
  const currentUser = findUserById(req.params.id);
  const follower = findUserById(followerId);

  if (!currentUser || !follower) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (!currentUser.followers.includes(followerId)) {
    currentUser.followers.push(followerId);
  }

  if (!follower.following.includes(req.params.id)) {
    follower.following.push(req.params.id);
  }

  res.json({ success: true, user: currentUser, follower });
});

app.get('/api/messages/:userId', (req, res) => {
  const messagesForUser = messages[req.params.userId] || [];
  res.json(messagesForUser);
});

app.post('/api/messages/:userId', (req, res) => {
  const { from, text } = req.body;
  if (!from || !text) {
    return res.status(400).json({ error: 'Sender and message are required' });
  }

  const entry = { id: `m${Date.now()}`, from, text, createdAt: new Date().toISOString() };

  if (!messages[req.params.userId]) {
    messages[req.params.userId] = [];
  }

  messages[req.params.userId].push(entry);
  res.status(201).json(entry);
});

app.get('/api/notifications', (req, res) => {
  res.json(notifications);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Social media app running at http://localhost:${PORT}`);
});
