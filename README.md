# EmployeeHub-MEAN

A responsive Employee Management System built with the **MEAN** stack (MongoDB, Express, Angular, Node.js).

## Features

- **Dashboard** – total / active / on-leave employees, departments, average salary, payroll, employees per department, recently added (all calculated from real database records)
- **Employees** – add, view, edit, delete with form validation
- **Search & filter** – search by name, email, ID or role; filter by department and status
- **Departments** – add, view, update, delete (a department with employees cannot be deleted)
- Loading states, empty states, toast notifications and friendly API error messages
- Mobile-first layout: bottom navigation on phones, sidebar on tablet/desktop

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular (standalone components, signals), TypeScript, CSS |
| Backend | Node.js, Express |
| Database | MongoDB Atlas, Mongoose |

## Architecture

```
Angular (port 4200)  --/api proxy-->  Express REST API (port 5000)  -->  MongoDB Atlas
```

## Folder structure

```
EmployeeHub-MEAN/
├── backend/
│   ├── config/db.js
│   ├── controllers/      employee, department, stats
│   ├── middleware/       errorHandler, asyncHandler
│   ├── models/           Employee, Department
│   ├── routes/index.js
│   ├── app.js
│   ├── server.js
│   ├── seed.js           optional sample data
│   └── .env.example
├── frontend/
│   ├── proxy.conf.json   forwards /api to the backend in development
│   └── src/app/          services, models, pages (dashboard, employees, departments)
├── .gitignore
├── LICENSE
└── README.md
```

## Installation

Requires Node.js 20+ and a free [MongoDB Atlas](https://www.mongodb.com/atlas) cluster
(Network Access must allow your IP, or `0.0.0.0/0` for development).

```bash
git clone https://github.com/ASHWIN07026/EmployeeHub-MEAN.git
cd EmployeeHub-MEAN
```

### Environment variables

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:

| Variable | Description |
|----------|-------------|
| `PORT` | API port (default `5000`) |
| `MONGODB_URI` | Your Atlas connection string, with a database name such as `/employeehub` |
| `CORS_ORIGIN` | Allowed frontend origin(s), comma-separated (default `http://localhost:4200`) |

`.env` is git-ignored – never commit it.

### Run the backend

```bash
cd backend
npm install
npm run seed     # optional: load sample data
npm start        # http://localhost:5000
```

### Run the frontend

In a second terminal:

```bash
cd frontend
npm install
npm start        # http://localhost:4200
```

## API endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| GET | `/api/stats` | Dashboard statistics |
| GET | `/api/employees?search=&department=&status=` | List / search / filter |
| GET | `/api/employees/:id` | Get one employee |
| POST | `/api/employees` | Create |
| PUT | `/api/employees/:id` | Update |
| DELETE | `/api/employees/:id` | Delete |
| GET | `/api/departments` | List (with employee counts) |
| GET | `/api/departments/:id` | Get one |
| POST | `/api/departments` | Create |
| PUT | `/api/departments/:id` | Update |
| DELETE | `/api/departments/:id` | Delete (blocked if in use) |

Errors return JSON `{ "message": "..." }` with 400 (validation), 404, 409 (duplicate / in use) or 500.

## Screenshots

_Add screenshots of the dashboard, employee list and form here (e.g. in a `screenshots/` folder)._

## Future improvements

- Authentication and role-based access
- Pagination and sorting
- CSV export
- Profile photos
- Unit and end-to-end tests

## Author

**ASHWIN S** – [github.com/ASHWIN07026](https://github.com/ASHWIN07026)
