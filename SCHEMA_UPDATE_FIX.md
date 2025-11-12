# Class Section Schema Update - Fixes Applied

## Problem
The application was showing errors when accessing class sections and timetables:
- `StrictPopulateError: Cannot populate path 'teachers' because it is not in your schema`
- Timetable generation failing with "No slots could be generated"

## Root Cause
The `ClassSection` schema was updated to use a `subjects` array (with embedded teacher references) instead of a direct `teachers` array, but the API routes were not updated accordingly.

### Old Structure
```typescript
{
  teachers: [ObjectId],  // Array of teacher IDs
  subject: string        // Single subject field
}
```

### New Structure
```typescript
{
  subjects: [{
    subject: string,              // Subject name
    teacher: ObjectId,            // Teacher reference
    hoursPerWeek: number,         // Hours per week
    sessionType: 'theory' | 'lab' | 'practical' | 'tutorial'
  }]
}
```

## Fixes Applied

### 1. Updated API Routes (`src/app/api/class-sections/route.ts`)
- Changed `.populate('teachers', ...)` to `.populate('subjects.teacher', ...)`
- Updated filtering logic from `filter.teachers` to `filter['subjects.teacher']`
- Modified POST endpoint to accept `subjects` array instead of `teachers` and `subject`
- Added validation for subjects array

### 2. Updated Individual Class Section Route (`src/app/api/class-sections/[id]/route.ts`)
- Updated GET endpoint to populate subjects.teacher
- Fixed permission checks to use `subjects.teacher` instead of `teachers`
- Updated PUT endpoint to handle subjects array
- Added population for theoryRoom and labRoom

### 3. Updated Teachers Management Route (`src/app/api/class-sections/[id]/teachers/route.ts`)
- Renamed functionality to manage subjects instead of just teachers
- POST now accepts subjects array with full subject details
- DELETE now supports removing subjects by name or teacher ID

## How to Fix Existing Data

### Step 1: Check Your Class Sections
Run the migration check script:
```bash
npx tsx scripts/migrate-class-sections.ts
```

This will show you which class sections need subjects configured.

### Step 2: Add Subjects to Class Sections

#### Option A: Using the Admin Interface
1. Log in as admin
2. Go to Classes/Class Sections
3. Edit each class section
4. Add subjects with:
   - Subject name (e.g., "Computer Science Engineering", "Data Structures and Algorithms")
   - Teacher assignment
   - Hours per week (e.g., 4)
   - Session type (theory/lab/practical/tutorial)

#### Option B: Using the API
Update a class section with subjects:
```bash
curl -X PUT http://localhost:3000/api/class-sections/[class-id] \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subjects": [
      {
        "subject": "Computer Science Engineering",
        "teacher": "teacher-id-here",
        "hoursPerWeek": 4,
        "sessionType": "theory"
      },
      {
        "subject": "Data Structures and Algorithms",
        "teacher": "another-teacher-id",
        "hoursPerWeek": 3,
        "sessionType": "lab"
      }
    ]
  }'
```

### Step 3: Create New Class Sections with Subjects
When creating new class sections, use this format:
```json
{
  "className": "CS Year 1 Section A",
  "department": "Computer Science",
  "academicYear": "2024-2025",
  "semester": "Fall 2024",
  "maxStudents": 50,
  "subjects": [
    {
      "subject": "Introduction to Programming",
      "teacher": "teacher-id",
      "hoursPerWeek": 4,
      "sessionType": "theory"
    }
  ],
  "theoryRoom": "room-id-for-theory",
  "labRoom": "room-id-for-lab"
}
```

## Timetable Generation

For timetable generation to work properly:

1. **Class sections must have subjects configured** with:
   - Valid subject names
   - Teacher assignments
   - Hours per week
   - Session types

2. **Rooms must exist and be active**:
   - Theory rooms for theory/tutorial sessions
   - Lab rooms for lab/practical sessions

3. **Teachers must exist** and have the 'teacher' role

### Generating Timetables
```bash
curl -X POST http://localhost:3000/api/timetables/generate \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "academicYear": "2024-2025",
    "semester": "Fall 2024",
    "effectiveFrom": "2024-09-01",
    "effectiveTo": "2024-12-31",
    "classSectionIds": ["class-id-1", "class-id-2"]
  }'
```

## Testing the Fixes

1. **Restart the development server**:
   ```bash
   npm run dev
   ```

2. **Test class sections page**:
   - Navigate to the online classes page
   - Verify that classes load without errors
   - Check that subjects and teachers are displayed correctly

3. **Test timetable generation**:
   - Go to the timetable page
   - Click "Generate Timetable"
   - Fill in the required fields
   - Verify timetables are generated successfully

## Migration Checklist

- [ ] Run migration check script
- [ ] Update existing class sections with subjects
- [ ] Verify all teachers are properly assigned
- [ ] Ensure rooms are configured (theory and lab)
- [ ] Test class sections listing
- [ ] Test timetable generation
- [ ] Verify timetable display

## Notes

- The old `teachers` array field no longer exists in the schema
- Each subject now has its own teacher assignment
- A class section can have multiple subjects, each with different teachers
- Timetable generation requires complete subject information
- Both theory and lab rooms can be assigned to class sections
