# Academic Management Dashboard

A full-stack web application for managing students, courses, faculty, and grades  built with **Next.js 16**, **MongoDB**, **Tailwind CSS**, and **TypeScript**.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Setup Instructions](#setup-instructions)
- [Environment Variables](#environment-variables)
- [Architecture & Design Decisions](#architecture--design-decisions)
- [API Reference](#api-reference)
- [Deployment](#deployment)

---

## Project Overview

The Academic Management Dashboard is a centralized platform for academic institutions to:

- Track and manage **students**, their enrolled courses, and academic progress
- Create and organize **courses** with department, credits, semester, and prerequisites
- Assign **faculty** to courses and manage teaching loads
- Record and view **grades** per student per course per semester
- View summary **statistics** and export data as CSV
- Navigate a fully responsive UI with dark mode support and smooth animations

---

## Features

| Area | Capabilities |
|---|---|
| Students | Add, edit, delete, view profile, paginate, search, export CSV |
| Courses | Add, edit, delete, view detail, filter by department, paginate |
| Faculty | View roster, department filter |
| Grades | Add/update grades filtered by enrolled courses, semester tracking |
| Dashboard | Live stats (totals), GPA distribution chart, enrollment chart |
| Reports | Analytics and exportable data |
| UI/UX | Animations (GSAP), toast notifications, confirm modals, dark mode |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router) |
| Language | TypeScript 5 |
| Database | MongoDB Atlas (via official `mongodb` driver) |
| Styling | Tailwind CSS 4 |
| HTTP Client | Axios |
| Charts | ApexCharts + react-apexcharts |
| Animations | GSAP 3 |
| Icons | lucide-react |
| Linting | ESLint (eslint-config-next) |
| Deployment | Vercel |

---

## Project Structure

```
my-app/
 app/
    layout.tsx          # Root layout (Navigation, global styles)
    page.tsx            # Dashboard home (stats, charts)
    students/           # Student list, profile, new, edit pages
    courses/            # Course list, detail, new, edit pages
    faculty/            # Faculty list page
    reports/            # Reports & analytics page
    api/                # Next.js Route Handlers (REST API)
        students/       # GET /api/students, POST, PATCH, DELETE
        courses/        # GET /api/courses, POST, PATCH, DELETE
        faculty/        # GET /api/faculty, POST, PATCH, DELETE
        grades/         # GET /api/grades, POST, PATCH, DELETE
        seed/           # POST /api/seed   seed database
        cleanup/        # POST /api/cleanup  wipe database
 components/             # Reusable UI components
    Navigation.tsx
    AnimatedCard.tsx
    AnimatedSection.tsx
    CommonModal.tsx
    CommonInput.tsx
    CommonSelect.tsx
    ConfirmModal.tsx
    CourseForm.tsx
    CourseEditModal.tsx
    StudentForm.tsx
    GradeSuccessModal.tsx
    Pagination.tsx
    StatCard.tsx
 lib/
    mongodb.ts          # Singleton MongoDB client
    api.ts              # Axios API layer (studentsApi, coursesApi, ...)
    utils.ts            # Helpers: filter, paginate, CSV export, GPA calc
 types/
    index.ts            # Shared TypeScript interfaces
 data/
    db.json             # Optional local JSON seed data
 public/                 # Static assets
 tailwind.config.js
 next.config.ts
 tsconfig.json
 vercel.json
```

---

## Setup Instructions

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- A **MongoDB Atlas** cluster (free tier is sufficient)  [create one here](https://www.mongodb.com/cloud/atlas)

### 1. Clone the repository

```bash
git clone https://github.com/your-username/academic-management-dashboard.git
cd academic-management-dashboard
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create a `.env.local` file in the project root:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/academic-management-dashboard?retryWrites=true&w=majority
```

> Replace `<username>`, `<password>`, and the cluster host with your actual Atlas credentials.

### 4. Seed the database (optional)

Start the dev server first, then call the seed endpoint:

```bash
npm run dev
# In a second terminal:
curl -X POST http://localhost:3000/api/seed
```

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Build for production

```bash
npm run build
npm start
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `MONGODB_URI` | Yes | MongoDB Atlas connection string |
| `NEXT_PUBLIC_API_URL` | No | Override API base URL (defaults to `/api`) |

---

## Architecture & Design Decisions

### 1. Next.js App Router with Route Handlers

All backend logic lives inside `app/api/` as **Next.js Route Handlers** (not a separate Express server). This keeps the project as a single deployable unit and enables seamless Vercel deployment. Each resource (`students`, `courses`, `faculty`, `grades`) has:

- `route.ts`  collection-level operations (`GET` list with pagination, `POST` create)
- `[id]/route.ts`  document-level operations (`GET` one, `PATCH` update, `DELETE`)

### 2. MongoDB with Singleton Client

`lib/mongodb.ts` implements the recommended **singleton pattern** for Next.js: in development, the client promise is attached to the Node.js `global` object to survive hot-reloads without exhausting the connection pool. In production, a fresh promise is created per cold start.

### 3. Typed API Layer (`lib/api.ts`)

All HTTP calls from the client go through a centralized Axios wrapper (`studentsApi`, `coursesApi`, `facultyApi`, `gradesApi`). This:

- Keeps components free of `axios` boilerplate
- Makes it trivial to swap the base URL (e.g., for a local JSON server vs. MongoDB)
- Handles multi-page `getAll()` fetching transparently

### 4. Server-side Pagination

List endpoints accept `?page=` and `?limit=` query params and return:

```json
{ "data": [], "total": 100, "page": 1, "limit": 10, "totalPages": 10 }
```

The UI uses this for server-driven pagination, falling back to client-side filtering when a search term or filter is active.

### 5. Reusable Component Library

Shared UI pieces (`CommonModal`, `CommonInput`, `CommonSelect`, `ConfirmModal`, `AnimatedCard`, etc.) enforce visual consistency and reduce duplication across the 10+ pages.

### 6. Animations

- **GSAP** drives entrance animations in `AnimatedSection` and `AnimatedCard`
- **Tailwind CSS transitions** handle row-level feedback (green flash on edit, red fade-out on delete)
- Toast notifications provide non-blocking success feedback

### 7. Dark Mode

Tailwind's `dark:` variant is used throughout. The class strategy is applied at the `<html>` level, enabling full dark/light switching without a page reload.

### 8. TypeScript Interfaces

All data shapes are defined once in `types/index.ts` (`Student`, `Course`, `Faculty`, `Grade`, form data variants) and shared between the API handlers and client components  no duplicated type definitions.

### 9. CSV Export

`lib/utils.ts` provides an `exportToCSV()` utility that serializes any array of objects to a downloadable `.csv` file client-side, handling nested arrays/objects and quote escaping.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/students` | List students (paginated) |
| POST | `/api/students` | Create a student |
| GET | `/api/students/:id` | Get student by ID |
| PATCH | `/api/students/:id` | Update student |
| DELETE | `/api/students/:id` | Delete student |
| GET | `/api/courses` | List courses (paginated) |
| POST | `/api/courses` | Create a course |
| GET | `/api/courses/:id` | Get course by ID |
| PATCH | `/api/courses/:id` | Update course |
| DELETE | `/api/courses/:id` | Delete course |
| GET | `/api/faculty` | List faculty |
| POST | `/api/faculty` | Create faculty |
| PATCH | `/api/faculty/:id` | Update faculty |
| DELETE | `/api/faculty/:id` | Delete faculty |
| GET | `/api/grades` | List grades |
| POST | `/api/grades` | Add a grade |
| PATCH | `/api/grades/:id` | Update grade |
| DELETE | `/api/grades/:id` | Delete grade |
| POST | `/api/seed` | Seed the database with sample data |
| POST | `/api/cleanup` | Remove all data from the database |
