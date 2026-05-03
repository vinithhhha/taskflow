
  TASKFLOW — TEAM TASK MANAGER
  Spring Boot 3 + React 18 + MySQL 8


LIVE URL:    https://comfortable-passion-production.up.railway.app
GITHUB REPO: https://github.com/vinithhhha/taskflow


  ABOUT THE PROJECT

TaskFlow is a full-stack team task management web application that allows
users to create projects, assign tasks, track progress, and collaborate
with role-based access control (Admin/Member).

  TECH STACK

  Backend  :  Java 21 + Spring Boot 3.3 + Spring Security 6
  Frontend :  React 18 + Vite + React Router 6
  Database :  MySQL 8 (Railway MySQL plugin)
  Auth     :  JWT (jjwt 0.12) + BCrypt password hashing
  ORM      :  Spring Data JPA + Hibernate
  Deploy   :  Railway (Backend + Frontend + MySQL)

  KEY FEATURES


  AUTHENTICATION
  - Signup / Login with JWT token-based authentication
  - BCrypt password hashing for security
  - First registered user is automatically Admin

  PROJECT MANAGEMENT
  - Create, edit, delete projects
  - Add/remove team members from projects
  - Role-based project access

  TASK MANAGEMENT
  - Create tasks with title, description, priority, due date
  - Assign tasks to team members
  - Kanban board: TODO → IN PROGRESS → DONE
  - Update task status with one click

  DASHBOARD
  - Total tasks, completed tasks, overdue tasks stats
  - Recent activity feed
  - My Tasks view (filtered by logged-in user)

  ROLE-BASED ACCESS CONTROL
  - ADMIN: Full access to all projects, users, team management
  - MEMBER: Access only to assigned projects, limited permissions


  PROJECT STRUCTURE

  taskflow/
  ├── backend/                        ← Spring Boot project (Java 21)
  │   ├── Dockerfile
  │   ├── pom.xml
  │   └── src/main/java/com/taskflow/
  │       ├── config/                 ← Security + Exception handling
  │       ├── controller/             ← REST API endpoints
  │       ├── dto/                    ← Data Transfer Objects
  │       ├── entity/                 ← JPA Entities
  │       ├── repository/             ← Spring Data JPA repos
  │       ├── security/               ← JWT filter + UserDetails
  │       └── service/                ← Business logic
  │
  └── frontend/                       ← React + Vite project
      └── src/
          ├── api/client.js           ← Axios with JWT interceptor
          ├── context/AuthContext.jsx ← Global auth state
          ├── components/             ← Reusable UI components
          └── pages/                  ← All app pages

  DATABASE SCHEMA

  users           : id, name, email, password, role, created_at
  projects        : id, name, description, owner_id, created_at
  project_members : id, project_id, user_id, role, joined_at
  tasks           : id, title, description, project_id, assignee_id,
                    created_by, status, priority, due_date, created_at

  REST API ENDPOINTS
 AUTH
  POST   /api/auth/signup       Register new user
  POST   /api/auth/login        Login and get JWT token
  GET    /api/auth/me           Get current user info

  USERS (Admin only)
  GET    /api/users             List all users
  PATCH  /api/users/{id}/role   Change user role
  DELETE /api/users/{id}        Delete user

  PROJECTS
  GET    /api/projects          List accessible projects
  POST   /api/projects          Create project
  GET    /api/projects/{id}     Get project details
  PUT    /api/projects/{id}     Update project
  DELETE /api/projects/{id}     Delete project
  POST   /api/projects/{id}/members        Add member
  DELETE /api/projects/{id}/members/{uid}  Remove member

  TASKS
  GET    /api/projects/{id}/tasks   List tasks in project
  POST   /api/projects/{id}/tasks   Create task
  PUT    /api/tasks/{id}            Update task
  PATCH  /api/tasks/{id}/status     Update task status
  DELETE /api/tasks/{id}            Delete task

  DASHBOARD
  GET    /api/dashboard         Get stats, recent tasks, overdue tasks


  SECURITY IMPLEMENTATION

  - Spring Security 6 with stateless JWT (no sessions)
  - OncePerRequestFilter for JWT validation on every request
  - BCrypt password hashing with auto salt rounds
  - @PreAuthorize annotations for method-level RBAC
  - CORS configured for frontend domain


  DEPLOYMENT


  Deployed on Railway:
  - MySQL 8 database service
  - Spring Boot backend (Docker container, Java 21)
  - React frontend (Node.js build + serve)

  Environment Variables Used:
  - DB_URL, DB_USERNAME, DB_PASSWORD
  - JWT_SECRET
  - CORS_ORIGINS
  - VITE_API_URL (frontend)


  LOCAL SETUP:


  Prerequisites: Java 21, Node.js 18+, MySQL 8, Maven

  BACKEND:
  1. Create MySQL database: taskflow
  2. Update backend/src/main/resources/application.properties
  3. cd backend && ./mvnw spring-boot:run
  4. Backend runs on http://localhost:8080

  FRONTEND:
  1. cd frontend
  2. npm install
  3. npm run dev
  4. Frontend runs on http://localhost:5173


  DEVELOPER:


  Name  : Vinitha
  GitHub: https://github.com/vinithhhha
  Repo  : https://github.com/vinithhhha/taskflow
