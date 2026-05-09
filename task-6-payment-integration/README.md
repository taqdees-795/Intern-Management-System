# Task 6 — Payment Integration for Premium Courses

## Overview
Stripe payment gateway integration for unlocking premium LMS courses.

## Login
Use your InternHub credentials (created via Task 2 Admin dashboard).
- **Admin:** `admin@internhub.com` / `Admin@2024`
- **Intern:** Use credentials set by admin in Task 2

## Setup
```bash
# Backend
cd backend && npm install && npm run dev   # runs on :5006

# Frontend (new terminal)
cd frontend && npm install && npm start    # runs on :3000
```

## Database
- MongoDB: `intern_management` (shared across all tasks)
- JWT Secret: `InternHub_SharedSecret_2024` (shared)
- Port: `5006`
