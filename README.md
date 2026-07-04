# 🚀 Placement Compass

> **Track Every Application. Never Miss an Opportunity.**

Placement Compass is a production-ready full-stack career management platform that helps students efficiently organize internship and placement applications, monitor interview progress, manage multiple resume versions, and visualize placement analytics—all from a single dashboard.

Built with **React, TypeScript, Tailwind CSS, Spring Boot, Spring Security, JWT Authentication, and MongoDB**, the application provides a secure and scalable solution for managing the complete placement journey.

---

## 📌 Problem Statement

Students usually apply to numerous internships and placement opportunities through LinkedIn, company career portals, referrals, and campus placements.

Managing these applications using spreadsheets, notes, reminders, and emails often results in:

- Missing Online Assessment (OA) deadlines
- Forgetting interview schedules
- Losing recruiter information
- Using incorrect resume versions
- Poor visibility into application progress

Placement Compass addresses these challenges by providing a centralized platform for managing every stage of the recruitment process.

---

# ✨ Features

## 🔐 Authentication & Security

- JWT Authentication
- Secure Login & Registration
- Role-Based Authorization
- Password Encryption using BCrypt
- Refresh Token Support
- Protected API Routes

---

## 📊 Dashboard

- Total Applications
- Applied Jobs
- Online Assessments
- Interview Progress
- Offers Received
- Rejections
- Success Rate Analytics
- Recent Activity
- Interactive Dashboard Cards

---

## 💼 Job Application Management

- Create Applications
- Update Applications
- Delete Applications
- Search Applications
- Filter by Status
- Sort Applications
- Track Company Details
- Application Timeline

---

## 🎯 Interview Tracker

- Multiple Interview Rounds
- Interview Schedule
- Meeting Links
- Interview Feedback
- Round Status
- Difficulty Level
- Notes

---

## 📄 Resume Manager

- Upload Multiple Resumes
- Resume Version Tracking
- Download Resume
- Delete Resume
- Resume Organization

---

## 📅 Calendar View

- Upcoming Interviews
- Online Assessment Dates
- Deadlines
- Event Visualization

---

## 📈 Analytics

- Application Statistics
- Status Distribution
- Monthly Trends
- Placement Progress
- Dashboard Insights

---

## 🎨 User Experience

- Responsive Design
- Modern Dashboard
- Smooth Animations
- Dark UI
- Search & Filtering
- Pagination
- Toast Notifications

---

# 🛠️ Tech Stack

## Frontend

- React
- TypeScript
- Tailwind CSS
- React Router
- Axios
- React Hook Form
- Zod
- Recharts
- FullCalendar
- Framer Motion
- React Hot Toast

---

## Backend

- Java 21
- Spring Boot
- Spring Security
- JWT Authentication
- Spring Data MongoDB
- Maven
- Lombok

---

## Database

- MongoDB

---

## Architecture

```
Placement_Compass
│
├── frontend
│   ├── components
│   ├── pages
│   ├── services
│   ├── hooks
│   ├── routes
│   ├── layouts
│   └── utils
│
├── backend
│   ├── controller
│   ├── service
│   ├── repository
│   ├── dto
│   ├── entity
│   ├── security
│   ├── config
│   ├── exception
│   └── util
│
└── README.md
```

---

# 🔐 Security Features

- JWT Token Authentication
- Spring Security
- Role-Based Access Control (RBAC)
- Password Encryption (BCrypt)
- Protected REST APIs
- Secure Request Validation

---

# 📡 REST APIs

### Authentication

- Register
- Login
- Refresh Token

### Applications

- Create Application
- Update Application
- Delete Application
- View Applications
- Dashboard Summary

### Interviews

- Add Interview Round
- Update Interview
- Delete Interview

### Resume

- Upload Resume
- Download Resume
- Delete Resume

---

# 📊 Project Highlights

- ✅ 25+ REST API Endpoints
- ✅ JWT-secured Authentication
- ✅ Role-Based Authorization
- ✅ Layered Spring Boot Architecture
- ✅ MongoDB Integration
- ✅ Responsive React UI
- ✅ Dashboard Analytics
- ✅ Interview Tracking
- ✅ Resume Management
- ✅ Search, Filtering & Pagination
- ✅ Calendar Integration

---

# ⚙️ Getting Started

## Clone Repository

```bash
git clone https://github.com/<your-username>/placement-compass.git
```

---

## Backend

```bash
cd backend
mvn spring-boot:run
```

Runs on

```
http://localhost:8080
```

---

## Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs on

```
http://localhost:5173
```

---

## MongoDB

Create a MongoDB database named:

```
placement_compass_db
```

Update your `application.properties`:

```properties
spring.data.mongodb.uri=mongodb://localhost:27017/placement_compass_db
```

---

# 📈 Future Enhancements

- Email Notifications
- Interview Preparation Checklist
- AI Resume Analysis
- Company Insights Dashboard
- Offer Comparison
- Export to PDF & Excel
- Docker Deployment
- CI/CD Pipeline
- Cloud Deployment

---

# 📷 Screenshots

> Add screenshots here after deployment.

### Login

<img width="100%" src="screenshots/login.png">

### Dashboard

<img width="100%" src="screenshots/dashboard.png">

### Applications

<img width="100%" src="screenshots/applications.png">

### Analytics

<img width="100%" src="screenshots/analytics.png">

---

# 👨‍💻 Author

**Sivasarathy A**

---

# ⭐ If you found this project useful, consider giving it a Star!
