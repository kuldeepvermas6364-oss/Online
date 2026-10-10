const express = require('express');
const { authenticateToken } = require('../utils/auth');
const { readDb, writeDb, sanitizeUser, getUserById } = require('../data/store');

const router = express.Router();

function buildPost(db, post) {
  const author = getUserById(post.userId);
  return {
    ...post,
    author: author ? sanitizeUser(author) : null,
    comments: post.comments.map((comment) => ({
      ...comment,
      author: getUserById(comment.userId) ? sanitizeUser(getUserById(comment.userId)) : null
    })),
    likesCount: post.likes.length,
    commentsCount: post.comments.length
  };
}

router.get('/:id', authenticateToken, (req, res) => {
  const db = readDb();
  const post = db.posts.find((entry) => entry.id === req.params.id);

  if (!post) {
    return res.status(404).json({ error: 'Post not found.' });
  }

  return res.json(buildPost(db, post));
});

router.post('/', authenticateToken, (req, res) => {
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

  return res.status(201).json(buildPost(db, post));
});

router.post('/:id/like', authenticateToken, (req, res) => {
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
      text: `${getUserById(userId).name} liked your post.`,
      createdAt: new Date().toISOString(),
      read: false
    });
  }

  writeDb(db);
  return res.json({ success: true, likesCount: post.likes.length });
});

router.post('/:id/comment', authenticateToken, (req, res) => {
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
    text: `${getUserById(req.user.sub).name} commented on your post.`,
    createdAt: new Date().toISOString(),
    read: false
  });

  writeDb(db);
  return res.status(201).json(comment);
});

module.exports = router;
