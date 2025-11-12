# Quick Setup Guide

## Current Status
Your database is currently empty. You need to set up the following before you can use the timetable features:

1. **Users** (admins, teachers, students)
2. **Rooms** (classrooms, labs)
3. **Class Sections** (with subjects and teacher assignments)
4. **Timetables** (generated from class sections)

## Step-by-Step Setup

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Create an Admin Account
Navigate to: `http://localhost:3000/signup`
- Create an account with admin role
- Or if you already have an account, log in

### 3. Add Users (Teachers and Students)
Go to: `http://localhost:3000/dashboard/users` (admin only)

**Add Teachers:**
- Click "Add User"
- Fill in:
  - Name: e.g., "Dr. John Smith"
  - Email: e.g., "john.smith@university.edu"
  - Role: Select "Teacher"
  - Employee ID: e.g., "T001"
- Click "Save"

**Add Students:**
- Click "Add User"
- Fill in:
  - Name: e.g., "Jane Doe"
  - Email: e.g., "jane.doe@university.edu"
  - Role: Select "Student"
  - Student ID: e.g., "S001"
- Click "Save"

### 4. Add Rooms
Go to: `http://localhost:3000/dashboard/rooms` (admin only)

**Add Theory Rooms:**
- Click "Add Room"
- Fill in:
  - Room Number: e.g., "101"
  - Room Name: e.g., "Lecture Hall A"
  - Building: e.g., "Main Building"
  - Room Type: "Classroom" or "Lecture Hall"
  - Seating Capacity: e.g., 50
- Click "Save"

**Add Lab Rooms:**
- Click "Add Room"
- Fill in:
  - Room Number: e.g., "LAB-201"
  - Room Name: e.g., "Computer Lab 1"
  - Building: e.g., "Technology Building"
  - Room Type: "Lab"
  - Seating Capacity: e.g., 30
- Click "Save"

### 5. Create Class Sections with Subjects
Go to: `http://localhost:3000/dashboard/classes` (admin only)

**Create a Class Section:**
- Click "Add Class Section"
- Fill in basic information:
  - Class Name: e.g., "Computer Science Year 1 Section A"
  - Class Code: e.g., "CS1A" (optional, auto-generated if empty)
  - Department: e.g., "Computer Science"
  - Academic Year: e.g., "2024-2025"
  - Semester: e.g., "Fall 2024"
  - Max Students: e.g., 50

- **Add Subjects** (IMPORTANT for timetable generation):
  Click "Add Subject" for each subject:
  
  Subject 1:
  - Subject Name: "Introduction to Programming"
  - Select Teacher: Choose from dropdown
  - Hours Per Week: 4
  - Session Type: "theory"
  
  Subject 2:
  - Subject Name: "Programming Lab"
  - Select Teacher: Choose from dropdown
  - Hours Per Week: 3
  - Session Type: "lab"
  
  Subject 3:
  - Subject Name: "Data Structures"
  - Select Teacher: Choose from dropdown
  - Hours Per Week: 4
  - Session Type: "theory"

- Select Theory Room (for theory subjects)
- Select Lab Room (for lab subjects)
- Click "Save"

### 6. Assign Students to Class Sections
- Go back to the class section you created
- Click "Edit"
- In the "Students" section, select students from the dropdown
- Click "Save"

### 7. Generate Timetables
Go to: `http://localhost:3000/dashboard/timetable` (admin only)

- Click "Generate Timetable"
- Fill in:
  - Academic Year: "2024-2025"
  - Semester: "Fall 2024"
  - Effective From: Select start date
  - Effective To: Select end date (optional)
  - Select Class Sections: Choose which classes to generate timetables for
- Click "Generate"

The system will automatically:
- Assign time slots (9 AM to 5 PM)
- Avoid teacher conflicts
- Avoid room conflicts
- Skip lunch hour (12:00-13:00)
- Assign appropriate rooms based on session type

## Troubleshooting

### "Failed to fetch class sections"
- **Fixed!** The API has been updated to work with the new schema structure
- Restart your dev server: `npm run dev`

### "No slots could be generated for [Subject]"
This happens when:
- Class section has no subjects configured
- No teachers assigned to subjects
- No rooms available
- Not enough time slots available

**Solution:**
- Make sure each class section has subjects with teacher assignments
- Ensure you have rooms configured (both theory and lab)
- Check that teachers exist in the system

### "StrictPopulateError: Cannot populate path 'teachers'"
- **Fixed!** This was because the API was trying to use an old field name
- The schema now uses `subjects` array with teacher references
- All API routes have been updated

## Quick Check Commands

Run these to check your database state:
```bash
# Check database state
npx tsx scripts/check-db-state.ts

# Check class sections
npx tsx scripts/migrate-class-sections.ts
```

## Example API Calls

If you prefer using the API directly:

### Create a Class Section
```bash
curl -X POST http://localhost:3000/api/class-sections \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "className": "Computer Science Year 1 Section A",
    "classCode": "CS1A",
    "department": "Computer Science",
    "academicYear": "2024-2025",
    "semester": "Fall 2024",
    "maxStudents": 50,
    "subjects": [
      {
        "subject": "Introduction to Programming",
        "teacher": "TEACHER_ID_HERE",
        "hoursPerWeek": 4,
        "sessionType": "theory"
      },
      {
        "subject": "Programming Lab",
        "teacher": "TEACHER_ID_HERE",
        "hoursPerWeek": 3,
        "sessionType": "lab"
      }
    ],
    "theoryRoom": "ROOM_ID_HERE",
    "labRoom": "LAB_ROOM_ID_HERE"
  }'
```

## Next Steps After Setup

Once you have data set up:
1. View class sections at `/dashboard/classes`
2. Generate timetables at `/dashboard/timetable`
3. Teachers can view their timetables
4. Students can view their class timetables

## Summary of Fixes Applied

✓ Fixed class sections API to use new `subjects` structure
✓ Updated all populate() calls to use `subjects.teacher`
✓ Fixed filtering logic for teacher-based queries
✓ Updated POST/PUT endpoints to handle subjects array
✓ Added proper validation for subjects
✓ Fixed timetable generation logic (already correct)

All errors should now be resolved once you add the necessary data!
