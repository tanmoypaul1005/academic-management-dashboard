# Quick Start Guide

## Prerequisites
- Node.js 18+ installed

## Steps to Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Start JSON Server (Terminal 1)
```bash
npm run json-server
```
✅ JSON Server will run on http://localhost:3001

### 3. Start Next.js App (Terminal 2)
```bash
npm run dev
```
✅ Application will run on http://localhost:3000

### 4. Open Browser
Navigate to: http://localhost:3000

## Available Pages

- **Dashboard**: http://localhost:3000/
  - View statistics, charts, and top students
  
- **Students**: http://localhost:3000/students
  - View all students
  - Add new student: http://localhost:3000/students/new
  - View student profile: http://localhost:3000/students/[id]
  - Edit student: http://localhost:3000/students/[id]/edit

- **Courses**: http://localhost:3000/courses
  - View all courses
  - Add new course: http://localhost:3000/courses/new
  - View course details: http://localhost:3000/courses/[id]
  - Edit course: http://localhost:3000/courses/[id]/edit

- **Faculty Panel**: http://localhost:3000/faculty
  - Assign students to courses
  - Add/update grades
  - Bulk operations (enroll/unenroll)

- **Reports**: http://localhost:3000/reports
  - View enrollment trends
  - View course performance
  - Export reports to CSV

## Quick Test Workflow

1. **View Dashboard**: See overview of students, courses, and faculty
2. **Add a Student**: 
   - Go to Students → Click "Add Student"
   - Fill form and select courses
   - Submit
3. **Add a Course**:
   - Go to Courses → Click "Add Course"
   - Fill form and assign faculty
   - Submit
4. **Assign Students via Faculty Panel**:
   - Go to Faculty Panel
   - Use "Assign Students" tab
   - Select course and students
   - Click "Assign Students"
5. **Add Grades**:
   - Go to Faculty Panel
   - Use "Add/Update Grades" tab
   - Fill the form and submit
6. **View Reports**:
   - Go to Reports
   - View charts and tables
   - Export data to CSV

## Features to Test

### Mobile Responsiveness
- Resize browser window or use mobile device
- Navigation menu becomes hamburger menu
- Tables become horizontally scrollable
- Cards stack vertically

### Search & Filters
- Students page: Search by name/email, filter by year/major/course
- Courses page: Search by name/code, filter by department

### Pagination
- Students and courses lists paginate at 10 items per page

### Dynamic Forms
- Student form: Check/uncheck multiple courses
- Course form: Check/uncheck multiple faculty
- Faculty panel: Select multiple students for bulk operations

### Validation
- Try submitting forms with empty required fields
- Try entering invalid email format
- Try entering GPA > 4.0

### CSV Export
- Go to Reports page
- Click any export button
- CSV file downloads automatically

## Troubleshooting

### Port Already in Use
If port 3000 or 3001 is already in use:
- Kill the process using that port
- Or change the port in package.json scripts

### API Not Responding
- Make sure JSON Server is running on port 3001
- Check terminal for any errors
- Restart JSON Server if needed

### Data Not Persisting
- This is expected behavior
- Data resets on page refresh (as per requirements)
- JSON Server keeps changes during session only

## Notes

- The application uses mock data from `db.json`
- Changes are not persisted to file (session-only)
- Page refresh resets data to initial state
- All CRUD operations work with optimistic updates

Enjoy exploring the Academic Management Dashboard! 🎓
