================================================================================
  TASKFLOW — TEAM TASK MANAGER
  Spring Boot 3 + React + MySQL
================================================================================

LIVE URL:    https://your-app.up.railway.app  (update after deploy)
GITHUB REPO: https://github.com/yourusername/taskflow

================================================================================
  TECH STACK
================================================================================

  Backend  :  Java 17 + Spring Boot 3.2 + Spring Security 6
  Frontend :  React 18 + Vite + React Router 6
  Database :  MySQL 8 (XAMPP locally / Railway MySQL plugin in production)
  Auth     :  JWT (jjwt 0.12) + BCrypt
  ORM      :  Spring Data JPA + Hibernate

================================================================================
  PROJECT STRUCTURE
================================================================================

  taskflow/
  ├── backend/                        ← Spring Boot project
  │   ├── pom.xml
  │   └── src/main/java/com/taskflow/
  │       ├── TaskFlowApplication.java
  │       ├── config/
  │       │   ├── SecurityConfig.java
  │       │   └── GlobalExceptionHandler.java
  │       ├── controller/
  │       │   ├── AuthController.java
  │       │   ├── UserController.java
  │       │   ├── ProjectController.java
  │       │   ├── TaskController.java
  │       │   └── DashboardController.java
  │       ├── dto/
  │       │   ├── AuthDto.java
  │       │   ├── UserDto.java
  │       │   ├── ProjectDto.java
  │       │   ├── TaskDto.java
  │       │   └── DashboardDto.java
  │       ├── entity/
  │       │   ├── User.java         (role: ADMIN / MEMBER)
  │       │   ├── Project.java
  │       │   ├── ProjectMember.java
  │       │   └── Task.java         (status: TODO/IN_PROGRESS/DONE, priority: LOW/MEDIUM/HIGH)
  │       ├── repository/
  │       │   ├── UserRepository.java
  │       │   ├── ProjectRepository.java
  │       │   ├── ProjectMemberRepository.java
  │       │   └── TaskRepository.java
  │       ├── security/
  │       │   ├── JwtUtil.java
  │       │   ├── JwtAuthFilter.java
  │       │   └── UserDetailsServiceImpl.java
  │       └── service/
  │           ├── AuthService.java
  │           ├── ProjectService.java
  │           ├── TaskService.java
  │           └── DashboardService.java
  │
  └── frontend/                       ← React + Vite project
      ├── package.json
      ├── vite.config.js
      ├── index.html
      └── src/
          ├── main.jsx
          ├── App.jsx
          ├── index.css
          ├── utils.js
          ├── api/client.js           ← Axios with JWT interceptor
          ├── context/AuthContext.jsx
          ├── components/Layout.jsx
          └── pages/
              ├── AuthPage.jsx
              ├── Dashboard.jsx
              ├── Projects.jsx
              ├── ProjectDetail.jsx   ← Kanban board
              ├── MyTasks.jsx
              └── Team.jsx            ← Admin only

================================================================================
  DATABASE SCHEMA
================================================================================

  users         : id, name, email, password, role (ADMIN/MEMBER), created_at
  projects      : id, name, description, owner_id → users.id, created_at
  project_members : id, project_id, user_id, role (ADMIN/MEMBER), joined_at
  tasks         : id, title, description, project_id, assignee_id,
                  created_by, status, priority, due_date, created_at, updated_at

  Note: Hibernate auto-creates/updates tables (ddl-auto=update)

================================================================================
  REST API ENDPOINTS
================================================================================

  POST   /api/auth/signup                  Register
  POST   /api/auth/login                   Login
  GET    /api/auth/me                      Current user

  GET    /api/users                        All users
  PATCH  /api/users/{id}/role              Change role (ADMIN only)
  DELETE /api/users/{id}                   Delete user (ADMIN only)

  GET    /api/projects                     List projects (filtered by access)
  POST   /api/projects                     Create project
  GET    /api/projects/{id}                Project detail + members
  PUT    /api/projects/{id}                Update project
  DELETE /api/projects/{id}                Delete project
  POST   /api/projects/{id}/members        Add member
  DELETE /api/projects/{id}/members/{uid}  Remove member

  GET    /api/projects/{id}/tasks          List tasks
  POST   /api/projects/{id}/tasks          Create task
  PUT    /api/tasks/{id}                   Update task
  PATCH  /api/tasks/{id}/status            Update status only
  DELETE /api/tasks/{id}                   Delete task

  GET    /api/dashboard                    Stats + recent + overdue + myTasks

================================================================================
  LOCAL SETUP (XAMPP + IntelliJ)
================================================================================

  STEP 1 — Start XAMPP
  ─────────────────────
  1. Open XAMPP Control Panel
  2. Start "Apache" and "MySQL"
  3. Open phpMyAdmin → http://localhost/phpmyadmin
  4. Create a new database named:  taskflow
     (or let Spring auto-create it — createDatabaseIfNotExist=true is set)

  STEP 2 — Configure Backend
  ───────────────────────────
  File: backend/src/main/resources/application.properties

  Check these values match your XAMPP:
    spring.datasource.url=jdbc:mysql://localhost:3306/taskflow?createDatabaseIfNotExist=true&...
    spring.datasource.username=root
    spring.datasource.password=        ← leave blank if no password set in XAMPP

  STEP 3 — Run Backend
  ─────────────────────
  Option A (IntelliJ):
    - Open the backend/ folder in IntelliJ IDEA
    - Let Maven download dependencies
    - Run TaskFlowApplication.java (main class)
    - Backend starts on http://localhost:8080

  Option B (Terminal):
    cd backend
    ./mvnw spring-boot:run

  STEP 4 — Run Frontend
  ──────────────────────
  Prerequisites: Node.js 18+ installed

  cd frontend
  npm install
  npm run dev

  Frontend starts on http://localhost:5173
  (Vite proxies /api → http://localhost:8080 automatically)

  STEP 5 — Use the App
  ─────────────────────
  Open http://localhost:5173
  Sign up → first user is auto-Admin!

================================================================================
  DEPLOYMENT ON RAILWAY (Step-by-Step)
================================================================================

  Railway deploys your GitHub repo. You'll deploy backend and frontend separately.

  ── STEP 1: Push to GitHub ────────────────────────────────────────────────────

  1. Create a GitHub account if you don't have one: https://github.com
  2. Create a new repository (e.g. "taskflow")
  3. In your project folder, open a terminal:

     git init
     git add .
     git commit -m "Initial commit"
     git remote add origin https://github.com/YOUR_USERNAME/taskflow.git
     git push -u origin main

  ── STEP 2: Create Railway Account ────────────────────────────────────────────

  1. Go to https://railway.app
  2. Click "Login" → Login with GitHub
  3. You get $5 free credit (enough to run the app for months lightly)

  ── STEP 3: Deploy MySQL Database ─────────────────────────────────────────────

  1. Click "New Project"
  2. Select "Deploy a template" → search "MySQL" → click it
  3. Railway creates a MySQL 8 instance
  4. Click the MySQL service → go to "Variables" tab
  5. Note down these values (you'll need them):
       MYSQL_HOST      (e.g. roundhouse.proxy.rlwy.net)
       MYSQL_PORT      (e.g. 14567)
       MYSQL_DATABASE  (e.g. railway)
       MYSQL_USER      (usually "root")
       MYSQL_PASSWORD  (auto-generated)

  ── STEP 4: Deploy Backend ────────────────────────────────────────────────────

  1. In the same Railway project, click "+ New Service"
  2. Select "GitHub Repo" → select your "taskflow" repo
  3. Railway detects it. Set the Root Directory to: backend
  4. Go to "Settings" → Build Command:
       ./mvnw clean package -DskipTests
  5. Start Command:
       java -jar target/taskflow-backend-1.0.0.jar
  6. Go to "Variables" tab → add these:

       DB_URL        = jdbc:mysql://MYSQL_HOST:MYSQL_PORT/MYSQL_DATABASE?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
       DB_USERNAME   = root   (or your MYSQL_USER)
       DB_PASSWORD   = (paste your MYSQL_PASSWORD)
       JWT_SECRET    = (any long random string, e.g. "abcdef1234567890abcdef1234567890abcdef12")
       CORS_ORIGINS  = https://YOUR_FRONTEND_URL.up.railway.app

  7. Click "Deploy" — wait 2-3 minutes
  8. Go to "Settings" → "Networking" → "Generate Domain"
     Note your backend URL: https://taskflow-backend-xxx.up.railway.app

  ── STEP 5: Deploy Frontend ───────────────────────────────────────────────────

  Before deploying, update the frontend to point to your Railway backend.
  Edit frontend/vite.config.js:

    // For PRODUCTION build, the React app needs the real API URL
    // Add this to frontend/src/api/client.js:
    const api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || '/api'
    })

  Create frontend/.env.production:
    VITE_API_URL=https://YOUR_BACKEND_URL.up.railway.app/api

  Then push changes to GitHub.

  In Railway:
  1. Click "+ New Service" → GitHub Repo → select taskflow
  2. Root Directory: frontend
  3. Build Command:  npm install && npm run build
  4. Start Command:  npx serve dist -p $PORT
  5. Add Variable:   VITE_API_URL = https://your-backend.up.railway.app/api
  6. Deploy!
  7. Generate Domain → your frontend URL

  Also update backend's CORS_ORIGINS with the frontend URL.

  ── STEP 6: Test Live App ─────────────────────────────────────────────────────

  1. Open your frontend Railway URL
  2. Sign up (first user = Admin automatically)
  3. Create projects, add tasks, invite team members

================================================================================
  ROLE-BASED ACCESS CONTROL
================================================================================

  ADMIN:
    ✓ See and manage ALL projects
    ✓ Delete any user, change roles
    ✓ Edit/delete any project
    ✓ Access Team Management page

  MEMBER:
    ✓ Create projects (becomes owner)
    ✓ Access only projects they're in
    ✓ Add/edit tasks in accessible projects
    ✓ Can only delete their own tasks
    ✗ No Team Management access
    ✗ Cannot see other users' private projects

================================================================================
  INTERVIEW TALKING POINTS (Spring Boot)
================================================================================

  1. Security: Spring Security 6 with stateless JWT (no sessions)
     - OncePerRequestFilter for JWT validation
     - BCrypt password hashing (salt rounds auto)
     - @PreAuthorize for method-level RBAC

  2. JPA: @OneToMany, @ManyToOne, @ManyToMany via join entity
     - Lazy vs Eager loading (Lazy on collections, Eager on single refs)
     - CascadeType.ALL + orphanRemoval for project → task cleanup
     - @Transactional on all write methods

  3. REST API:
     - Proper HTTP verbs (GET/POST/PUT/PATCH/DELETE)
     - DTOs to avoid exposing entities directly (prevents circular refs)
     - Global @RestControllerAdvice for exception handling

  4. Architecture:
     - 3-layer: Controller → Service → Repository
     - Entity ↔ DTO conversion in service/DTO layer
     - Repositories extend JpaRepository (CRUD for free)

  5. Database:
     - MySQL with Hibernate (DDL auto-update)
     - Foreign keys enforced at DB level
     - JPQL custom queries in repositories

================================================================================
  DEMO SCRIPT FOR VIDEO (2-5 min)
================================================================================

  0:00 - Open live URL, show login page
  0:20 - Sign up as Admin (explain first user = admin rule)
  0:40 - Dashboard overview — show empty stats
  1:00 - Create a project "Product Launch"
  1:15 - Open Kanban board, add 3 tasks with different priorities/due dates
  1:45 - Drag (click) tasks to update status, show board update
  2:00 - Open Members modal, show member management
  2:15 - Open new browser tab → sign up as Member
  2:30 - Back to Admin → add Member to project
  2:45 - In Member tab → login, show they can only see their project
  3:10 - Back to Admin → Team page → promote/demote member
  3:30 - Dashboard → show stats update with tasks
  3:45 - My Tasks page — show filtered task list
  4:00 - Wrap up: mention Spring Boot + React + MySQL + Railway

================================================================================
