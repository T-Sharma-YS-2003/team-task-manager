# TaskFlow — Team Task Manager

A full-stack team task management app built with the MERN stack.

🔗 **[Live Demo](https://team-task-manager-i3rs.onrender.com)**

---

## Features

- JWT authentication with role-based access (Admin / Member)
- Admins can create projects, assign tasks, and manage team members
- Members can view and update the status of their assigned tasks
- Dashboard with live stats (total, in-progress, done, overdue)
- Filter tasks by status, priority, project, and overdue
- Fully responsive UI

---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18, Parcel, Tailwind CSS    |
| Backend    | Node.js, Express.js               |
| Database   | MongoDB Atlas + Mongoose          |
| Auth       | JWT + bcryptjs                    |
| Deployment | Render                            |

---

## Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/team-task-manager.git
cd team-task-manager
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a `.env` file in the root

```env
PORT=5000
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret_key
NODE_ENV=development
```

### 4. Run locally

```bash
npm run dev
```

- Frontend: http://localhost:1234
- Backend: http://localhost:5000

---

## Deployment (Render)

1. Push your code to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Connect your GitHub repository
4. Set the following in Render's dashboard:

| Setting         | Value                                              |
|-----------------|----------------------------------------------------|
| Build Command   | `npm install --include=dev && npm run build`       |
| Start Command   | `node server/index.js`                             |

5. Add environment variables under **Environment**:

```
MONGODB_URI=your_mongodb_atlas_uri
JWT_SECRET=your_secret_key
NODE_ENV=production
```

6. In **MongoDB Atlas → Network Access**, allow `0.0.0.0/0` (all IPs) so Render can connect.

---

## API Routes

### Auth
| Method | Route             | Description         |
|--------|-------------------|---------------------|
| POST   | /api/auth/signup  | Register a new user |
| POST   | /api/auth/login   | Login               |
| GET    | /api/auth/me      | Get current user    |

### Projects
| Method | Route                              | Description           |
|--------|------------------------------------|-----------------------|
| GET    | /api/projects                      | Get all projects      |
| POST   | /api/projects                      | Create a project      |
| GET    | /api/projects/:id                  | Get project by ID     |
| PUT    | /api/projects/:id                  | Update a project      |
| DELETE | /api/projects/:id                  | Delete a project      |
| POST   | /api/projects/:id/members          | Add a member          |
| DELETE | /api/projects/:id/members/:userId  | Remove a member       |

### Tasks
| Method | Route            | Description        |
|--------|------------------|--------------------|
| GET    | /api/tasks       | Get all tasks      |
| POST   | /api/tasks       | Create a task      |
| PUT    | /api/tasks/:id   | Update a task      |
| DELETE | /api/tasks/:id   | Delete a task      |
| GET    | /api/tasks/stats | Get task stats     |

---

## Role Permissions

| Action                  | Admin | Member |
|-------------------------|-------|--------|
| Create project          | ✅    | ❌     |
| Delete project          | ✅    | ❌     |
| Add / remove members    | ✅    | ❌     |
| Create / delete task    | ✅    | ❌     |
| Edit task (all fields)  | ✅    | ❌     |
| Update task status      | ✅    | ✅     |
| View assigned tasks     | ✅    | ✅     |