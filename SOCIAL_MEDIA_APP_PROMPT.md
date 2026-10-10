# Social Media App Development Prompt

## Project Overview
Build a full-featured social media application with user authentication, content sharing, real-time messaging, and social interactions.

## Core Features Required

### 1. User Management
- **Registration & Authentication**
  - Email/phone-based signup with verification
  - Secure password hashing (bcrypt/argon2)
  - JWT-based authentication tokens
  - OAuth2 integration (Google, Facebook, GitHub)
  - Session management with refresh tokens

- **User Profile**
  - Profile picture upload with image optimization
  - Bio, location, website, and interests
  - Follow/Unfollow functionality
  - User search and discovery
  - Privacy settings (public/private profiles)
  - User blocking functionality

### 2. Content Management
- **Posts/Feeds**
  - Create, read, update, delete posts
  - Support for text, images, and video content
  - Hashtag support with trending tags
  - Rich text editor with formatting
  - Scheduled posting
  - Drafts management

- **Timeline Feed**
  - Personalized feed based on follows
  - Chronological and algorithmic feed sorting
  - Infinite scroll pagination
  - Bookmark posts functionality

### 3. Social Interactions
- **Likes & Comments**
  - Like/unlike posts and comments
  - Nested comment threads
  - Comment edit and delete
  - Like counters and user lists
  - Mention functionality (@mentions)

- **Sharing & Notifications**
  - Share posts to other users
  - Repost/Retweet functionality
  - Real-time notifications
  - Push notifications
  - Notification preferences/settings

### 4. Messaging
- **Direct Messages**
  - One-to-one private messaging
  - Message encryption
  - Read receipts
  - Typing indicators
  - Message history and search
  - Media sharing in messages
  - Group chat support

- **Real-time Updates**
  - WebSocket integration for live messaging
  - Real-time notification delivery
  - Online/offline status indicators

### 5. Search & Discovery
- **Search Functionality**
  - Full-text search for posts, users, hashtags
  - Advanced filtering options
  - Search history
  - Trending topics and hashtags
  - Suggested users and content

### 6. Security & Privacy
- **Data Protection**
  - HTTPS/TLS encryption
  - Input validation and sanitization
  - SQL injection prevention (parameterized queries)
  - XSS protection
  - CSRF tokens

- **Privacy Controls**
  - Privacy policies and terms of service
  - Data export functionality (GDPR compliance)
  - Account deletion
  - Content moderation tools
  - Report inappropriate content

## Technical Stack Recommendations

### Backend
- **Framework**: Node.js (Express/NestJS), Python (Django/FastAPI), or Go
- **Database**: PostgreSQL for relational data, Redis for caching
- **Authentication**: JWT, OAuth2
- **Real-time**: WebSocket, Socket.io, or GraphQL subscriptions
- **File Storage**: AWS S3, Azure Blob, or Google Cloud Storage
- **Message Queue**: Redis, RabbitMQ for async tasks
- **Search**: Elasticsearch for full-text search

### Frontend
- **Framework**: React, Vue, or Angular
- **State Management**: Redux, Vuex, or Context API
- **Real-time Client**: Socket.io client library
- **UI Components**: Material-UI, Bootstrap, Tailwind CSS
- **Image Optimization**: Next.js Image, React Lazyload

### Mobile
- **Cross-platform**: React Native or Flutter
- **Native**: iOS (Swift), Android (Kotlin)
- **Push Notifications**: Firebase Cloud Messaging (FCM)

### DevOps
- **Containerization**: Docker
- **Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions, GitLab CI, Jenkins
- **Monitoring**: Prometheus, Grafana, ELK Stack
- **Deployment**: AWS, Azure, Google Cloud, or DigitalOcean

## Database Schema (Key Tables)

```sql
-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  profile_picture_url TEXT,
  bio TEXT,
  location VARCHAR(100),
  website VARCHAR(255),
  is_private BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Posts
CREATE TABLE posts (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  image_url TEXT,
  video_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP,
  is_deleted BOOLEAN DEFAULT false
);

-- Follows
CREATE TABLE follows (
  follower_id UUID NOT NULL REFERENCES users(id),
  following_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_id, following_id)
);

-- Likes
CREATE TABLE likes (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  post_id UUID REFERENCES posts(id),
  comment_id UUID,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Comments
CREATE TABLE comments (
  id UUID PRIMARY KEY,
  post_id UUID NOT NULL REFERENCES posts(id),
  user_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Direct Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY,
  sender_id UUID NOT NULL REFERENCES users(id),
  recipient_id UUID NOT NULL REFERENCES users(id),
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Notifications
CREATE TABLE notifications (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES users(id),
  type VARCHAR(50) NOT NULL,
  related_user_id UUID REFERENCES users(id),
  related_post_id UUID REFERENCES posts(id),
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints Structure

### Users
- `POST /api/v1/auth/register` - Register new user
- `POST /api/v1/auth/login` - Login user
- `GET /api/v1/users/:id` - Get user profile
- `PUT /api/v1/users/:id` - Update user profile
- `POST /api/v1/users/:id/follow` - Follow user
- `DELETE /api/v1/users/:id/follow` - Unfollow user

### Posts
- `GET /api/v1/feed` - Get user's feed
- `POST /api/v1/posts` - Create new post
- `GET /api/v1/posts/:id` - Get post details
- `PUT /api/v1/posts/:id` - Update post
- `DELETE /api/v1/posts/:id` - Delete post
- `POST /api/v1/posts/:id/like` - Like post
- `DELETE /api/v1/posts/:id/like` - Unlike post

### Comments
- `GET /api/v1/posts/:id/comments` - Get comments
- `POST /api/v1/posts/:id/comments` - Create comment
- `DELETE /api/v1/comments/:id` - Delete comment

### Messages
- `GET /api/v1/messages/:userId` - Get conversation
- `POST /api/v1/messages/:userId` - Send message
- `GET /api/v1/conversations` - List conversations

### Search
- `GET /api/v1/search?q=query` - Search posts/users

## Performance Optimization
- Implement database indexing on frequently queried fields
- Use caching (Redis) for user profiles, feeds, trending data
- Implement pagination with cursor-based or offset-based approach
- Image optimization and CDN for media delivery
- Database query optimization and N+1 query prevention
- Rate limiting on API endpoints
- Lazy loading on frontend

## Testing Strategy
- Unit tests for business logic
- Integration tests for API endpoints
- End-to-end tests for critical user flows
- Load testing for scalability validation
- Security testing (OWASP Top 10)

## Deployment Checklist
- Environment configuration (.env files)
- Database migrations and seeding
- API documentation (Swagger/OpenAPI)
- Error logging and monitoring
- Backup and disaster recovery plan
- Load balancing configuration
- SSL certificate setup
- Analytics integration

## Future Enhancements
- Stories feature (24-hour auto-delete)
- Live streaming capability
- AI-powered content recommendations
- Video editing tools
- Podcast/audio content support
- E-commerce integration
- Influencer analytics dashboard
- Monetization features
- AR filters for images/videos
