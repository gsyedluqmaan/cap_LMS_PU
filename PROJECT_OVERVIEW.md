# Campus LMS - Learning Management System

## Project Overview

Campus LMS is a comprehensive Learning Management System designed for educational institutions, built with modern web technologies. The system provides role-based access control for administrators, teachers, and students to manage academic activities efficiently.

## Current Features

### 1. Authentication & Authorization
- **JWT-based authentication** with HTTP-only cookies
- **Dual token storage** (localStorage + cookies) for enhanced security
- **Role-based access control** (Admin, Teacher, Student)
- Secure login/logout functionality
- Protected routes with middleware validation

### 2. User Management
- Create and manage user accounts
- Role assignment (Admin, Teacher, Student)
- User profile management
- Employee ID and Student ID tracking
- Department-based user organization

### 3. Class Section Management
- Create and manage class sections
- Assign teachers to classes
- Enroll students in classes
- Department and semester organization
- Academic year tracking
- Class capacity management
- Unique class codes for each section

### 4. Online Classes
- View assigned classes (role-based)
- Search and filter classes by:
  - Class name
  - Class code
  - Subject
  - Department
- Schedule management with date and time
- Meeting platform integration (Zoom, Google Meet, Teams)
- Class enrollment tracking

### 5. Academic Calendar
- Create and manage calendar events
- Event types (Exam, Holiday, Meeting, Deadline, Class, Other)
- Date and time scheduling
- Event visibility management
- Department-specific events

### 6. Dashboard
- Role-specific dashboards for Admin, Teacher, and Student
- Quick access to key features
- Navigation sidebar with role-based menu items
- Logout functionality

## Technical Stack

### Frontend
- **Next.js 14+** with App Router
- **React 18** for UI components
- **TypeScript** for type safety
- **Tailwind CSS** for styling
- **Lucide React** for icons

### Backend
- **Next.js API Routes** for RESTful endpoints
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcrypt** for password hashing

### Key Libraries
- **Axios** for HTTP requests with interceptors
- **date-fns** for date manipulation
- **React Hooks** for state management

## Architecture Highlights

### Security Features
1. **Server-side middleware** for route protection
2. **HTTP-only cookies** to prevent XSS attacks
3. **Token verification** on both client and server
4. **Password hashing** with bcrypt
5. **Role-based authorization** at API level

### Performance Optimizations
1. **Request deduplication** to prevent concurrent API calls
2. **Circuit breaker pattern** for failed API requests
3. **Pagination** for large data sets
4. **Lazy loading** and code splitting
5. **API response caching**

## Project Structure

```
cap_LMS_PU/
├── src/
│   ├── app/
│   │   ├── api/              # API route handlers
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── calendar/     # Calendar event endpoints
│   │   │   ├── classes/      # Class management endpoints
│   │   │   ├── class-sections/ # Class section endpoints
│   │   │   └── users/        # User management endpoints
│   │   ├── dashboard/        # Dashboard pages
│   │   │   ├── calendar/     # Calendar view
│   │   │   ├── online-classes/ # Online classes view
│   │   │   ├── students/     # Student management
│   │   │   └── teachers/     # Teacher management
│   │   ├── login/            # Login page
│   │   └── register/         # Registration page
│   ├── components/           # Reusable React components
│   │   ├── ApiDebug.tsx      # API debugging widget
│   │   ├── CalendarModals.tsx # Calendar event modals
│   │   ├── ClassModals.tsx   # Class management modals
│   │   ├── DashboardLayout.tsx # Main layout component
│   │   ├── Sidebar.tsx       # Navigation sidebar
│   │   ├── StudentModals.tsx # Student management modals
│   │   └── TeacherModals.tsx # Teacher management modals
│   ├── lib/
│   │   ├── auth.ts           # Authentication utilities
│   │   ├── axios.ts          # Axios configuration
│   │   └── db.ts             # Database connection
│   ├── models/               # Mongoose schemas
│   │   ├── CalendarEvent.ts  # Calendar event model
│   │   ├── Class.ts          # Class model
│   │   ├── ClassSection.ts   # Class section model
│   │   └── User.ts           # User model
│   └── services/             # API service layer
│       ├── calendarService.ts # Calendar API calls
│       ├── classService.ts   # Class API calls
│       └── userService.ts    # User API calls
└── middleware.ts             # Next.js middleware for auth
```

## Database Models

### User Model
- Basic info: name, email, password
- Role: student, teacher, admin
- IDs: studentId, employeeId
- Department and academic info
- Timestamps

### Class Section Model
- Class details: name, code, description
- Subject and department
- Academic year and semester
- Teachers and students arrays
- Capacity management
- Schedule information
- Active status

### Calendar Event Model
- Event details: title, description
- Date and time
- Event type
- Visibility settings
- Department association
- Creator tracking

## Upcoming Features

### 1. Timetable Management System 🚀
A comprehensive timetable management system to organize and visualize class schedules.

#### Planned Features:
- **Weekly Timetable View**
  - Grid-based layout showing all classes by day and time
  - Color-coded by department/subject
  - Drag-and-drop interface for scheduling

- **Room Management**
  - Assign classrooms to sessions
  - Track room availability
  - Room capacity management

- **Multi-view Options**
  - Student view: Personal timetable
  - Teacher view: Teaching schedule
  - Admin view: Overall institution schedule
  - Department view: Department-specific schedules

- **Export & Print**
  - PDF export of timetables
  - Print-friendly formats
  - iCal/Google Calendar integration

## Development Roadmap

### Phase 1: Foundation ✅
- [x] User authentication and authorization
- [x] Role-based access control
- [x] Basic dashboard structure
- [x] User management
- [x] Class section management

### Phase 2: Core Features ✅
- [x] Online classes module
- [x] Academic calendar
- [x] Class scheduling basics
- [x] Bug fixes and optimizations

### Phase 3: Timetable Management 🔄 (In Planning)
- [ ] Design timetable database schema
- [ ] Create timetable UI components
- [ ] Implement conflict detection
- [ ] Room management system
- [ ] Multi-view timetable displays
- [ ] Export and integration features

### Phase 4: Attendance Management 🔄 (In Planning)
- [ ] Design attendance database schema
- [ ] Create attendance marking interface
- [ ] Implement QR code system
- [ ] Build reporting and analytics
- [ ] Leave management integration
- [ ] Notification system

### Phase 5: Advanced Features 📋 (Future)
- [ ] Assignment and homework management
- [ ] Grade management system
- [ ] Communication portal (messaging)
- [ ] Resource library
- [ ] Examination management
- [ ] Student performance analytics
- [ ] Parent portal
- [ ] Mobile application

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- MongoDB database
- Environment variables configured

### Environment Variables
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Installation Steps
```bash
# Clone the repository
git clone https://github.com/gsyedluqmaan/cap_LMS_PU.git

# Navigate to project directory
cd cap_LMS_PU

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### User Endpoints
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `POST /api/users/create` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `GET /api/users/students` - Get all students
- `GET /api/users/teachers` - Get all teachers

### Class Section Endpoints
- `GET /api/class-sections` - Get all class sections
- `GET /api/class-sections/:id` - Get class section by ID
- `GET /api/class-sections/user/:userId` - Get user's class sections
- `POST /api/class-sections` - Create class section
- `PUT /api/class-sections/:id` - Update class section
- `DELETE /api/class-sections/:id` - Delete class section

### Calendar Endpoints
- `GET /api/calendar/events` - Get all events
- `GET /api/calendar/events/:id` - Get event by ID
- `POST /api/calendar/events` - Create event
- `PUT /api/calendar/events/:id` - Update event
- `DELETE /api/calendar/events/:id` - Delete event

## Contributing

### Development Guidelines
1. Follow TypeScript best practices
2. Use ESLint and Prettier for code formatting
3. Write meaningful commit messages
4. Create feature branches for new features
5. Test thoroughly before submitting PRs

### Code Style
- Use functional components with hooks
- Implement proper error handling
- Add TypeScript types for all functions
- Follow Next.js App Router conventions
- Keep components modular and reusable

## Testing

### Current Testing Strategy
- Manual testing for all features
- Browser console monitoring
- API debugging widget
- Error logging and monitoring

### Planned Testing Improvements
- Unit tests with Jest
- Integration tests with React Testing Library
- E2E tests with Playwright
- API testing with Supertest
- Performance testing

## Known Issues & Limitations

### Current Limitations
1. No real-time collaboration features yet
2. Limited mobile responsiveness (in progress)
3. No file upload/management system
4. Basic search functionality
5. No advanced analytics dashboard

### Issues Being Addressed
- ✅ Infinite API loop (Fixed)
- ✅ Authentication token synchronization (Fixed)
- ✅ Role-based access issues (Fixed)
- Mobile UI improvements (In Progress)
- Performance optimization (Ongoing)

## Security Considerations

### Implemented Security Measures
1. JWT authentication with HTTP-only cookies
2. Password hashing with bcrypt
3. CSRF protection via same-site cookies
4. Role-based authorization at API level
5. Input validation and sanitization
6. SQL injection prevention via Mongoose
7. XSS protection through React

### Planned Security Enhancements
- Rate limiting for API endpoints
- Two-factor authentication (2FA)
- Password strength requirements
- Session management improvements
- Audit logging for sensitive actions
- Regular security audits

## Performance Metrics

### Current Performance
- Initial page load: ~2-3 seconds
- API response time: ~100-300ms
- Client-side navigation: <100ms

### Optimization Goals
- Reduce initial bundle size
- Implement server-side caching
- Optimize database queries
- Add CDN for static assets
- Implement progressive web app (PWA)

## Support & Documentation

### Resources
- GitHub Repository: https://github.com/gsyedluqmaan/cap_LMS_PU
- Issue Tracker: GitHub Issues
- Documentation: This file and inline code comments

### Contact
For questions or support, please open an issue on GitHub.

## License

This project is developed for educational purposes.

---

**Last Updated:** November 5, 2025  
**Version:** 1.0.0  
**Status:** Active Development  
**Maintainer:** gsyedluqmaan
