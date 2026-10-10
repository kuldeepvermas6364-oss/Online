const state = {
  currentUser: null,
  users: [],
  feed: [],
  notifications: [],
  messages: []
};

const userPill = document.getElementById('user-pill');
const profileCard = document.getElementById('profile-card');
const feedContainer = document.getElementById('feed');
const messagesBox = document.getElementById('messages-box');
const notificationsBox = document.getElementById('notifications-box');
const postInput = document.getElementById('post-input');
const postBtn = document.getElementById('post-btn');

const api = async (url, options = {}) => {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }

  return data;
};

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });
};

const getCurrentUser = async () => {
  if (!state.currentUser) {
    const user = await api('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email: 'aisha@example.com' })
    });
    state.currentUser = user.user;
  }

  return state.currentUser;
};

const renderProfile = () => {
  if (!state.currentUser) return;

  profileCard.innerHTML = `
    <div class="profile-card">
      <img class="profile-avatar" src="${state.currentUser.avatar}" alt="${state.currentUser.name}" />
      <div>
        <strong>${state.currentUser.name}</strong><br />
        <small>@${state.currentUser.username}</small>
      </div>
      <p>${state.currentUser.bio}</p>
      <div>
        <strong>${state.currentUser.followers.length}</strong> followers
      </div>
      <div>
        <strong>${state.currentUser.following.length}</strong> following
      </div>
    </div>
  `;

  userPill.textContent = state.currentUser.name;
};

const renderFeed = () => {
  if (!state.feed.length) {
    feedContainer.innerHTML = '<div class="card">No posts yet.</div>';
    return;
  }

  feedContainer.innerHTML = `<div class="feed">${state.feed
    .map(
      (post) => `
        <article class="post-card">
          <div class="post-header">
            <img src="${post.author.avatar}" alt="${post.author.name}" />
            <div>
              <div class="post-user">${post.author.name}</div>
              <div class="post-meta">@${post.author.username} • ${formatDate(post.createdAt)}</div>
            </div>
          </div>

          <p>${post.content}</p>
          ${post.image ? `<img class="post-image" src="${post.image}" alt="Post image" />` : ''}

          <div class="post-actions">
            <button class="action-btn" data-action="like" data-post-id="${post.id}">❤️ ${post.likes.length}</button>
            <button class="action-btn" data-action="comment" data-post-id="${post.id}">💬 ${post.comments.length}</button>
          </div>

          <div class="comment-list">
            ${post.comments
              .map(
                (comment) => `
                  <div class="comment">
                    <strong>${comment.author?.name || 'User'}:</strong> ${comment.text}
                  </div>
                `
              )
              .join('')}
            <input type="text" data-comment-input="${post.id}" placeholder="Write a comment..." />
          </div>
        </article>
      `
    )
    .join('')}</div>`;

  feedContainer.querySelectorAll('[data-action="like"]').forEach((button) => {
    button.addEventListener('click', async () => {
      const postId = button.dataset.postId;
      try {
        await api(`/api/posts/${postId}/like`, {
          method: 'POST',
          body: JSON.stringify({ userId: state.currentUser.id })
        });
        await loadApp();
      } catch (error) {
        alert(error.message);
      }
    });
  });

  feedContainer.querySelectorAll('[data-comment-input]').forEach((input) => {
    input.addEventListener('keydown', async (event) => {
      if (event.key === 'Enter' && input.value.trim()) {
        const postId = input.dataset.commentInput;
        try {
          await api(`/api/posts/${postId}/comment`, {
            method: 'POST',
            body: JSON.stringify({
              userId: state.currentUser.id,
              text: input.value.trim()
            })
          });
          input.value = '';
          await loadApp();
        } catch (error) {
          alert(error.message);
        }
      }
    });
  });
};

const renderMessages = () => {
  if (!state.messages.length) {
    messagesBox.innerHTML = '<div class="message-item">No messages</div>';
    return;
  }

  messagesBox.innerHTML = `
    <div class="message-list">
      ${state.messages
        .map(
          (message) => `
            <div class="message-item">
              <strong>${message.from === state.currentUser.id ? 'You' : 'Other'}:</strong> ${message.text}
            </div>
          `
        )
        .join('')}
    </div>
  `;
};

const renderNotifications = () => {
  notificationsBox.innerHTML = `
    <div class="notification-list">
      ${state.notifications
        .map(
          (notification) => `
            <div class="notification-item">${notification.text}</div>
          `
        )
        .join('')}
    </div>
  `;
};

const loadApp = async () => {
  try {
    const currentUser = await getCurrentUser();
    const [feed, notifications, messages] = await Promise.all([
      api('/api/feed'),
      api('/api/notifications'),
      api(`/api/messages/${currentUser.id}`)
    ]);

    state.currentUser = currentUser;
    state.feed = feed;
    state.notifications = notifications;
    state.messages = messages;

    renderProfile();
    renderFeed();
    renderMessages();
    renderNotifications();
  } catch (error) {
    console.error(error);
    alert(error.message);
  }
};

postBtn.addEventListener('click', async () => {
  const content = postInput.value.trim();
  if (!content) return;

  try {
    await api('/api/posts', {
      method: 'POST',
      body: JSON.stringify({
        userId: state.currentUser.id,
        content,
        image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80'
      })
    });
    postInput.value = '';
    await loadApp();
  } catch (error) {
    alert(error.message);
  }
});

loadApp();
