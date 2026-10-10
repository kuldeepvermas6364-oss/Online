# Online Social Media App

A production-style social media starter built with Node.js and Express. This version is organized into routes, data access, auth helpers, and a clean frontend shell so it is easier to extend into a real production application.

## Features

- JWT-based authentication and secure password hashing
- User registration and login
- Follow system
- Feed generation for followed users
- Create, like, and comment on posts
- Messaging and notifications APIs
- File-based local persistence for quick development
- Modular backend architecture for easier scaling

## Tech stack

- Node.js
- Express
- JWT
- bcryptjs
- dotenv
- Vanilla JavaScript frontend

## Quick start

1. Install dependencies:
   npm install

2. Copy environment template:
   cp .env.example .env

3. Start the app:
   npm start

4. Open the app:
   http://localhost:3000

## Demo users

- aisha@online.app / Password123!
- rahul@online.app / Password123!
- neha@online.app / Password123!

## Project structure

- `server.js` – application bootstrap
- `src/data/store.js` – data persistence and seed data
- `src/routes/` – modular API route files
- `src/utils/auth.js` – JWT generation and auth middleware
- `public/` – frontend assets
- `.env.example` – environment variable template

## Notes

This is still a local-development starter, not a full cloud production deployment. It is structured to be expanded into PostgreSQL, Redis, WebSockets, containerization, and CI/CD workflows as the product grows.
