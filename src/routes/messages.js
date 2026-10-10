const express = require('express');
const { authenticateToken } = require('../utils/auth');
const { readDb, sanitizeUser, getUserById } = require('../data/store');

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

router.get('/', authenticateToken, (req, res) => {
  const db = readDb();
  const currentUser = getUserById(req.user.sub);
  if (!currentUser) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const followedUserIds = new Set(currentUser.following.concat(currentUser.id));

  const feed = db.posts
    .filter((post) => followedUserIds.has(post.userId))
    .map((post) => buildPost(db, post))
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return res.json(feed);
});

module.exports = router;
