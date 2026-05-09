# Task 5 — Task Automation System

## Overview
Cron-based automatic task creation, deadline tracking, 24h/1h email reminders, and admin monitoring.

## Login
Use your InternHub credentials (created via Task 2 Admin dashboard).
- **Admin:** `admin@internhub.com` / `Admin@2024`
- **Intern:** Use credentials set by admin in Task 2

## Setup
```bash
# Backend
cd backend && npm install && npm run dev   # runs on :5005

# Frontend (new terminal)
cd frontend && npm install && npm start    # runs on :3000
```

## Database
- MongoDB: `intern_management` (shared across all tasks)
- JWT Secret: `InternHub_SharedSecret_2024` (shared)
- Port: `5005`
