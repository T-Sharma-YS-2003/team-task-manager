# TaskFlow — Team Task Manager

A full-stack team task management app built with the MERN stack.

## Live Demo
[your-app.railway.app](https://your-app.railway.app)

## Features
- JWT authentication with role-based access (Admin / Member)
- Admins can create projects, assign tasks, manage team members
- Members can view and update status of their assigned tasks
- Dashboard with live stats (total, in-progress, done, overdue)
- Filter tasks by status, priority, project, overdue
- Fully responsive UI

## Tech Stack
- **Frontend:** React 18, Parcel, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Database:** MongoDB Atlas + Mongoose
- **Auth:** JWT + bcryptjs
- **Deployment:** Railway

## Local Setup

### 1. Clone the repo
git clone https://github.com/yourusername/team-task-manager.git
cd team-task-manager

### 2. Install dependencies
npm install

### 3. Create .env file
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret_key
NODE_ENV=development

### 4. Run locally
npm run dev

Frontend: http://localhost:1234
Backend: http://localhost:5000

## API Routes

### Auth
- POST /api/auth/signup
- POST /api/auth/login
- GET  /api/auth/me

### Projects
- GET    /api/projects
- POST   /api/projects
- GET    /api/projects/:id
- PUT    /api/projects/:id
- DELETE /api/projects/:id
- POST   /api/projects/:id/members
- DELETE /api/projects/:id/members/:userId

### Tasks
- GET    /api/tasks
- POST   /api/tasks
- PUT    /api/tasks/:id
- DELETE /api/tasks/:id
- GET    /api/tasks/stats

## Role Permissions

| Action | Admin | Member |
|--------|-------|--------|
| Create project | ✅ | ❌ |
| Delete project | ✅ | ❌ |
| Add/remove members | ✅ | ❌ |
| Create/delete task | ✅ | ❌ |
| Edit task (all fields) | ✅ | ❌ |
| Update task status | ✅ | ✅ |
| View assigned tasks | ✅ | ✅ |