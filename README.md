# Online Social Media App

A production-oriented social media app starter built with Node.js and Express. This version adds important production concerns such as security hardening, rate limiting, structured environment config, logging, and container-friendly setup.

## Features

- JWT-based authentication and secure password hashing
- User registration and login
- Follow system
- Feed generation with followed accounts
- Post creation, likes, and comments
- Notifications and messaging APIs
- Local JSON persistence for quick development
- Security middleware: helmet, CORS, rate limiting, compression
- Docker Compose support for Postgres and Redis
- Environment config via .env files

## Tech stack

- Node.js
- Express
- JWT
- bcryptjs
- Docker
- Postgres / Redis (via compose)
- Vanilla JavaScript frontend

## Quick start

1. Install dependencies:
   npm install

2. Create environment file:
   cp .env.example .env

3. Start the app:
   npm start

4. Open the app:
   http://localhost:3000

## Docker startup

1. Start services:
   npm run docker:up

2. Stop services:
   npm run docker:down

## Demo users

- aisha@online.app / Password123!
- rahul@online.app / Password123!
- neha@online.app / Password123!

## Production next steps

This starter is designed to be taken into a full production implementation with:
- PostgreSQL + Prisma or Sequelize
- Redis caching and session management
- WebSocket real-time chat
- CI/CD pipeline with testing
- Cloud deployment on Render, Railway, or AWS
- S3 storage for media uploads
- Observability via logs and metrics

## Project structure

- `server.js` – app bootstrap and middleware wiring
- `src/data/store.js` – persistence layer
- `src/routes/` – modular API routes
- `src/utils/auth.js` – JWT authentication helpers
- `src/config/env.js` – env configuration
- `src/middleware/` – error and 404 handling
- `public/` – frontend assets
