
# 🚀 InternHub — Complete Intern Management Ecosystem

> *A unified MERN-based internship platform integrating onboarding, project showcase, resume builder, task automation, payments, and real-time collaboration into one ecosystem.*

---

## 🔐 Authentication System (Unified Access)

All modules are connected through a **shared authentication system (JWT-based)** using a single MongoDB database.

✔ Register once in Task 2
✔ Login works across all modules

### 👤 Default Admin Account

```
Email: admin@internhub.com  
Password: Admin@2024
```

---

## 📁 Project Architecture

| Task | Module            | Description                        | Port |
| ---- | ----------------- | ---------------------------------- | ---- |
| 2    | Intern Management | Admin & intern dashboard system    | 5002 |
| 3    | Showcase Platform | Project portfolio & sharing system | 5003 |
| 4    | Resume Builder    | Resume creation with PDF export    | 5004 |
| 5    | Task Automation   | Scheduling & reminder system       | 5005 |
| 6    | Payment System    | Stripe/PayPal integration          | 5006 |
| 7    | Collaboration     | Real-time Kanban with Socket.IO    | 5007 |

---

## ⚙️ How to Run the Project

### 🗄️ Step 1: Start MongoDB

```bash
mongod
```

---

### 🖥️ Step 2: Run Backend Services

Each task runs independently:

```bash
cd task-2-intern-management/backend  && npm install && npm run dev
cd task-3-showcase-platform/backend  && npm install && npm run dev
cd task-4-resume-builder/backend     && npm install && npm run dev
cd task-5-task-automation/backend    && npm install && npm run dev
cd task-6-payment-integration/backend && npm install && npm run dev
cd task-7-collaboration/backend      && npm install && npm run dev
```

---

### 🎨 Step 3: Run Frontend Apps

```bash
cd task-X/frontend && npm install && npm start
```

---

## 🔄 System Flow

```
Admin (Task 2)
   ↓
Intern Onboarding + Authentication
   ↓
Shared Login System
   ↓
Task 3 → Portfolio Showcase
Task 4 → Resume Builder (PDF Export)
Task 5 → Automated Tasks & Notifications
Task 6 → Secure Payments (Premium Access)
Task 7 → Real-Time Collaboration (Socket.IO)
```

---

## 🎨 UI Theme System

```
Background: #222831 (Deep Charcoal)
Cards:      #393E46 (Slate Gray)
Accent:     #C8A96E (Antique Gold)
Text:       #DFD0B8 (Soft Ivory)
Muted:      #948979 (Warm Mocha)
```

### ✨ Typography

* Headings: **Playfair Display**
* Body: **Inter**

---

## 🚀 Key Highlights

✔ Full MERN Stack Architecture
✔ Modular Micro-Project Structure
✔ Real-Time Communication (Socket.IO)
✔ Secure Authentication (JWT)
✔ Payment Gateway Integration(using stripe Sandbox account)
✔ PDF Generation System
✔ Scalable Folder-Based Design

---

## 💡 Project Vision

This system demonstrates how multiple real-world applications can be integrated into a **single scalable internship ecosystem**, simulating production-level full-stack development workflows.
