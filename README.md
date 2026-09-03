# 🎓 ULEP — University Learning & Earning Platform

> A peer-to-peer campus freelancing ecosystem inspired by Fiverr's marketplace utility and GitHub's open-source collaborative workflow.

---

## 📌 Overview

**ULEP (University Learning & Earning Platform)** is a full-stack platform built for university students to outsource and contribute to academic, creative, or technical tasks. 

Instead of a closed bidding system, ULEP follows a **GitHub-style open contribution model**: discussions and inquiries on open tasks are publicly visible until a contributor is officially assigned, moving the task to a private workspace.

---

## ✨ Key Highlights & Features

- **Open-Source Contribution Flow:**
  - **Public Phase:** Open tasks allow public communication and questions on the post thread (similar to GitHub issue discussions).
  - **Task Assignment:** Job posters review contributor requests from *Take Task* and assign the task to an applicant.
  - **Private Execution:** Once assigned, the task moves into the contributor's *My Work* dashboard, enabling private communication between the poster and the assignee.

- **Automated Lifecycle with Cron Jobs:**
  - Integrated with `node-cron` to automatically delete completed jobs after **24 hours**, keeping the database clean and active.

- **Authentication & Security:**
  - Continuous 34-hour session persistence via `express-session` (no repeated re-logins).
  - Email verification powered by `nodemailer`, `crypto`, and `jsonwebtoken`.
  - Secure profile and document file handling using `multer`.
  - Route protection middleware ensuring authentic user access across endpoints.

- **Core Navigation:**
  - `Take Task`: Browse, filter, and request open campus tasks.
  - `Post Job`: Publish new tasks with requirements and guidelines.
  - `My Post`: Poster dashboard to review listings, applicants, and assignments.
  - `My Work`: Worker dashboard to track active tasks and deliverables.
  - `Profile`: User details, verification status, and activity.

---

## 🛠️ Tech Stack

- **Runtime & Framework:** Node.js, Express.js
- **Templating Engine:** EJS, `ejs-mate` (Server-Side Rendering)
- **Database:** MongoDB, Mongoose ODM
- **Scheduling & Automation:** `node-cron` (auto-delete completed tasks after 24h)
- **Authentication & Security:** `express-session`, `jsonwebtoken`, `crypto`
- **File Uploads:** `multer`
- **Mailing:** `nodemailer`
- **Styling:** Bootstrap 5, Custom CSS

---

## 📂 Project Structure

```text
Ulep self/
├── models/
│   ├── jobSchema.js
│   └── userSchema.js
├── routes/
│   └── post-routes.js
├── views/
├── public/
├── .env
├── .env.example
├── .gitignore
├── app.js
├── package.json
└── package-lock.json
```

## 🚀 Getting Started
Follow these steps to run ULEP on your local machine:

### 1. Prerequisites
Node.js installed

MongoDB running locally or a MongoDB Atlas URI

### 2. Clone the Repository

git clone repo_url

### 3. Install Dependencies

npm install

### 4. Environment Setup
Create a .env file in the root directory (refer to .env.example):

Code snippet
PORT=4000 /n
MONGO_URI=your_mongodb_connection_string /n
SESSION_SECRET=your_session_secret_key /n
JWT_SECRET=your_jwt_secret /n
EMAIL_USER=your_email@gmail.com  /n
EMAIL_PASS=your_app_password  /n

### 5. Start the Application

node app.js
Or with nodemon (if installed):


nodemon app.js
Open your browser and navigate to:

http://localhost:4000 \n 
📄 License \n
This project is open-source and available under the MIT License.
