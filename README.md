# 🎓 Nexus Academy - Learning Management System

A full-stack Learning Management System (LMS) built with React and Node.js, designed for students, instructors, and administrators.

---

## ✨ Core Features

### For Students
- **Course Catalog:** Browse, search, and enroll in courses.
- **Learning Dashboard:** Track progress, view active courses, and access earned certificates.
- **Interactive Player:** Watch lessons and automatically save your progress.
- **PDF Certificates:** Automatically receive a certificate upon 95% course completion.

### For Instructors
- **Course Management:** Create, edit, and manage courses, sections, and lessons.
- **Media Uploads:** Securely upload and stream video content via Google Drive.
- **Analytics:** Monitor student enrollment, course ratings, and revenue.
- **Revenue Tracking:** Integrated dashboard to view earnings and payment history.

### For Administrators
- **User Management:** Oversee all platform users and manage roles.
- **Content Oversight:** Manage course categories and review content.
- **System Analytics:** View high-level data on enrollments, users, and revenue.

---

## 🛠️ Tech Stack

#### **Backend**
- **Runtime:** Node.js with Express.js
- **Database:** MS SQL Server (`mssql`, `msnodesqlv8`)
- **Authentication:** JWT, Passport.js (Google OAuth 2.0)
- **Payments:** Stripe API
- **File Storage:** Google Drive API
- **Services:** Nodemailer (Emails), Puppeteer (PDF Generation)

#### **Frontend**
- **Framework:** React (Vite) with TypeScript
- **Styling:** Tailwind CSS & Shadcn UI
- **State Management:** TanStack Query (React Query)
- **Routing:** React Router DOM

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- MS SQL Server
- Stripe, Google Cloud, and Gmail API credentials.

### Installation

**1. Backend Setup**
```bash
# Navigate to the backend folder
cd backend

# Install dependencies
npm install

# Create and configure your environment file
cp .env.example .env
# Open .env and add your API keys and database credentials

# Start the server
npm start
```

**2. Frontend Setup**
```bash
# Navigate to the frontend folder
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```
The frontend will be available at `http://localhost:8081`.

---

## 🔑 Configuration

The backend relies on an `.env` file for configuration. Key variables include:

- `DB_SERVER`, `DB_NAME`, `DB_INSTANCE`: Your MS SQL Server connection details.
- `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`: Stripe API keys.
- `CLIENT_ID`, `CLIENT_SECRET`: Google OAuth credentials.
- `PARENT_FOLDER_ID`: The Google Drive folder ID for media uploads.
- `JWT_SECRET`: A secret key for signing tokens.
- `OTP_EMAIL`, `OTP_PASSWORD`: Credentials for sending emails via Nodemailer.
- `FRONTEND_URL`: The base URL of the running frontend application.

---

## 📖 API Documentation

Once the backend server is running, you can explore the interactive API documentation at:
[http://localhost:4000/api-docs](http://localhost:7860/api-docs)

---

## 📜 License

This project is licensed under the ISC License.
