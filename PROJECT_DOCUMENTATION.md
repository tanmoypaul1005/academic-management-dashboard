# Academic Management Dashboard

A comprehensive Next.js-based academic management system that provides an interactive interface for administrators and faculty members to view, manage, and analyze student performance and course data.

## Features

### 1. Dashboard
- **Summary Statistics**: Display total students, courses, and faculty members
- **Top-Ranking Students**: Leaderboard sorted by GPA
- **Most Popular Courses**: Sorted by enrollment count
- **Interactive Charts**: Bar charts for course enrollments using ApexCharts

### 2. Student & Course Management

#### Students
- **List View**: Complete list of students with search, filters (course, year, major), and pagination
- **Student Profile**: View individual student details with:
  - Enrolled courses
  - Grades and progress summary
  - Academic performance metrics
- **Create/Update**: Reusable forms with dynamic input fields
  - Support for multiple course enrollments
  - Form validation
- **Delete**: Remove student records

#### Courses
- **List View**: Course catalog with search and department filters
- **Course Details**: View course information including:
  - Assigned faculty members
  - Enrollment numbers
  - Enrolled students list
- **Create/Update**: Forms with dynamic faculty assignment
  - Multiple instructor support
  - Form validation
- **Delete**: Remove course records

### 3. Faculty Panel
- **Assign Students to Courses**: Select course and assign multiple students
- **Add/Update Grades**: Form for entering student grades with validation
- **Bulk Actions**: 
  - Bulk enroll/unenroll students
  - Dynamic forms with checkbox selections
  - Optimistic UI updates

### 4. Reporting & Exporting
- **Visualizations**:
  - Course enrollments over time (line chart)
  - Top courses by average grade (bar chart)
- **Reports**:
  - Course enrollment analysis
  - Top-performing students per course
  - Course performance analysis
- **Export to CSV**: Download reports in Excel-compatible format
  - Course enrollments report
  - Top students report
  - All grades report

### 5. UI/UX Features
- **Responsive Design**: Mobile-first design using Tailwind CSS
- **Mobile Navigation**: Hamburger menu for small screens
- **Loading States**: Skeleton screens and spinners
- **Error Handling**: User-friendly error messages
- **Optimistic Updates**: Immediate UI updates with background sync

## Technical Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: Tailwind CSS
- **Charts**: ApexCharts / React-ApexCharts
- **API**: JSON Server (Mock API)
- **HTTP Client**: Axios
- **Language**: TypeScript

## Setup Instructions

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd my-app
```

2. Install dependencies:
```bash
npm install
```

3. Start the JSON Server (Mock API):
```bash
npm run json-server
```
This will start the API server on http://localhost:3001

4. In a new terminal, start the Next.js development server:
```bash
npm run dev
```
This will start the application on http://localhost:3000

5. Open your browser and navigate to http://localhost:3000

## Project Structure

```
my-app/
├── app/                      # Next.js App Router pages
│   ├── courses/             # Course management pages
│   ├── faculty/             # Faculty panel
│   ├── reports/             # Reports and analytics
│   ├── students/            # Student management pages
│   ├── layout.tsx           # Root layout with navigation
│   └── page.tsx             # Dashboard page
├── components/              # Reusable React components
│   ├── CourseForm.tsx       # Form for creating/editing courses
│   ├── Navigation.tsx       # Sidebar navigation
│   ├── StatCard.tsx         # Statistics card component
│   └── StudentForm.tsx      # Form for creating/editing students
├── lib/                     # Utility functions and API
│   ├── api.ts              # API client with Axios
│   └── utils.ts            # Helper functions (CSV export, filtering, etc.)
├── types/                   # TypeScript type definitions
│   └── index.ts            # All interface definitions
├── db.json                 # Mock database for JSON Server
└── package.json            # Project dependencies
```

## API Endpoints

The JSON Server provides the following endpoints:

- `GET/POST /students` - List/Create students
- `GET/PATCH/DELETE /students/:id` - Get/Update/Delete student
- `GET/POST /courses` - List/Create courses
- `GET/PATCH/DELETE /courses/:id` - Get/Update/Delete course
- `GET/POST /faculty` - List/Create faculty
- `GET/PATCH/DELETE /faculty/:id` - Get/Update/Delete faculty member
- `GET/POST /grades` - List/Create grades
- `GET/PATCH/DELETE /grades/:id` - Get/Update/Delete grade

## Key Features Implementation

### Dynamic Forms
Forms support dynamic input fields using checkbox selections:
- Student form: Multiple course enrollments
- Course form: Multiple faculty assignments
- Bulk operations: Multiple student selections

### Validation
All forms include comprehensive validation:
- Required field checks
- Email format validation
- Numeric range validation (GPA, grades, etc.)
- Custom error messages

### Mobile Responsiveness
- Responsive grid layouts (1 column on mobile, 2-3 on tablet, 3-4 on desktop)
- Mobile-friendly navigation with hamburger menu
- Overflow-x-auto for tables on small screens
- Touch-friendly buttons and interactive elements

### Optimistic Updates
- Immediate UI updates when creating/updating/deleting
- Background API calls with error handling
- Automatic data refresh after operations

### CSV Export
Export functionality converts data to Excel-compatible CSV format:
- Handles arrays and objects in cells
- Proper escaping of special characters
- Custom filename generation

## Data Persistence

**Important**: As per requirements, data resets to the initial state after page refresh. The JSON Server provides a simulated database experience without permanent persistence.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Future Enhancements

- User authentication and role-based access control
- Real-time updates using WebSockets
- Advanced filtering and search
- More chart types and visualizations
- PDF report generation
- Email notifications

## License

MIT License

## Author

Built with Next.js, TypeScript, and Tailwind CSS
