# 🚀 InternHub — Complete Intern Management Ecosystem

> "This system integrates intern onboarding, project showcasing, resume generation, task automation, payment-based learning, and real-time collaboration into a unified MERN-based internship management ecosystem."

---

## 🔐 Shared Authentication — One Login, All Modules

All 7 tasks share the **SAME MongoDB database** and **SAME JWT secret**.
Register once in Task 2 → login everywhere.

### Admin Credentials (auto-created on startup)
```
Email:    admin@internhub.com
Password: Admin@2024
```

---

## 📁 Task Structure

| # | Folder | Description | Port |
|---|--------|-------------|------|
| Task 2 | `task-2-intern-management`   | Core admin + intern dashboard | :5002 |
| Task 3 | `task-3-showcase-platform`   | Project portfolio & shareable links | :5003 |
| Task 4 | `task-4-resume-builder`      | Resume builder with PDF export | :5004 |
| Task 5 | `task-5-task-automation`     | Cron job automation & reminders | :5005 |
| Task 6 | `task-6-payment-integration` | PayPal/Stripe premium courses | :5006 |
| Task 7 | `task-7-collaboration`       | Real-time Kanban + Socket.IO | :5007 |

---

## 🚀 How to Run

```bash
# 1. Start MongoDB locally
mongod

# 2. Run any backend (each in a separate terminal)
cd task-2-intern-management/backend  && npm install && npm run dev
cd task-3-showcase-platform/backend  && npm install && npm run dev
cd task-4-resume-builder/backend     && npm install && npm run dev
cd task-5-task-automation/backend    && npm install && npm run dev
cd task-6-payment-integration/backend && npm install && npm run dev
cd task-7-collaboration/backend      && npm install && npm run dev

# 3. Run any frontend (each in a separate terminal)
cd task-X-name/frontend && npm install && npm start
```

---

## 🌐 Intern Flow

```
Admin (Task 2) → Onboards intern → Sets internshipType
      ↓
Intern uses same credentials to login to:
  Task 3 → Upload & showcase projects
  Task 4 → Build professional resume (PDF export)
  Task 5 → View automated tasks & reminders
  Task 6 → Purchase premium courses
  Task 7 → Collaborate on real-time Kanban board
```

---

## 🎨 Color Theme

```
#222831  Deep Charcoal  → Backgrounds
#393E46  Slate          → Cards, sidebar  
#948979  Warm Mocha     → Labels, subtitles
#DFD0B8  Ivory Cream    → Main text
#C8A96E  Antique Gold   → Buttons, accents ✨
```

Fonts: **Playfair Display** (headings) + **Inter** (body)
