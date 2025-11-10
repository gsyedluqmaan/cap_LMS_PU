# Timetable Management API - Usage Examples

This document provides example API calls for testing the timetable management system.

## Authentication

All requests require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Room Management API

### 1. Create a Room (Admin Only)

**Endpoint:** `POST /api/rooms`

**Request Body:**
```json
{
  "roomNumber": "A101",
  "roomName": "Computer Science Lab 1",
  "roomType": "lab",
  "building": "Academic Block A",
  "floor": "1",
  "seatingCapacity": 40,
  "hasProjector": true,
  "hasWhiteboard": true,
  "hasComputers": true,
  "computerCount": 40,
  "hasAC": true,
  "hasWifi": true,
  "facilities": ["Smart Board", "High-speed Internet"],
  "description": "Primary computer science lab with latest equipment"
}
```

**Response:** (201 Created)
```json
{
  "message": "Room created successfully",
  "data": {
    "_id": "65abc123...",
    "roomNumber": "A101",
    "roomName": "Computer Science Lab 1",
    "fullLocation": "Academic Block A, Floor 1, Room A101",
    ...
  }
}
```

### 2. Get All Rooms

**Endpoint:** `GET /api/rooms?page=1&limit=20&roomType=lab&building=Academic`

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `search` - Search in room number, name, or building
- `roomType` - Filter by room type (lab, classroom, lecture-hall, etc.)
- `building` - Filter by building name
- `isActive` - Filter by active status (true/false)

**Response:** (200 OK)
```json
{
  "data": [
    {
      "_id": "65abc123...",
      "roomNumber": "A101",
      "roomName": "Computer Science Lab 1",
      "roomType": "lab",
      "building": "Academic Block A",
      "seatingCapacity": 40,
      ...
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 45,
    "itemsPerPage": 20
  }
}
```

### 3. Update a Room (Admin Only)

**Endpoint:** `PUT /api/rooms/65abc123...`

**Request Body:** (only include fields to update)
```json
{
  "seatingCapacity": 45,
  "computerCount": 45,
  "description": "Upgraded with 5 additional computers"
}
```

### 4. Delete a Room (Admin Only)

**Endpoint:** `DELETE /api/rooms/65abc123...`

**Response:** (200 OK)
```json
{
  "message": "Room deleted successfully"
}
```

## Timetable Management API

### 1. Create a Timetable Manually (Admin Only)

**Endpoint:** `POST /api/timetables`

**Request Body:**
```json
{
  "classSection": "65def456...",
  "academicYear": "2024-2025",
  "semester": "Fall 2024",
  "effectiveFrom": "2024-09-01",
  "effectiveTo": "2024-12-31",
  "slots": [
    {
      "day": "Monday",
      "startTime": "09:00",
      "endTime": "10:00",
      "subject": "Data Structures",
      "teacher": "65teacher1...",
      "room": "65room1...",
      "sessionType": "theory"
    },
    {
      "day": "Monday",
      "startTime": "10:00",
      "endTime": "11:00",
      "subject": "Programming Lab",
      "teacher": "65teacher2...",
      "room": "65room2...",
      "sessionType": "lab"
    }
  ]
}
```

**Response:** (201 Created)
```json
{
  "message": "Timetable created successfully",
  "data": {
    "_id": "65timetable1...",
    "classSection": {
      "_id": "65def456...",
      "className": "CS-A",
      "classCode": "CSA001",
      "department": "Computer Science"
    },
    "academicYear": "2024-2025",
    "semester": "Fall 2024",
    "slots": [...],
    ...
  }
}
```

**Error Response - Conflict Detected:** (400 Bad Request)
```json
{
  "error": "Teacher conflict: Teacher already scheduled for Data Structures on Monday from 09:00 to 10:00"
}
```

### 2. Get Timetables (Role-Based)

#### Admin - Get All Timetables

**Endpoint:** `GET /api/timetables`

**Response:** (200 OK)
```json
{
  "data": [
    {
      "_id": "65timetable1...",
      "classSection": {
        "className": "CS-A",
        "classCode": "CSA001",
        "department": "Computer Science"
      },
      "academicYear": "2024-2025",
      "semester": "Fall 2024",
      "slots": [...]
    }
  ]
}
```

#### Admin - Get Timetable for Specific Class

**Endpoint:** `GET /api/timetables?classSection=65def456...`

#### Teacher - Get Aggregated Timetable

**Endpoint:** `GET /api/timetables`

**Response:** (200 OK)
```json
{
  "data": {
    "aggregatedView": true,
    "slots": [
      {
        "day": "Monday",
        "startTime": "09:00",
        "endTime": "10:00",
        "subject": "Data Structures",
        "teacher": {...},
        "room": {...},
        "classSection": {
          "className": "CS-A",
          ...
        },
        "academicYear": "2024-2025",
        "semester": "Fall 2024"
      },
      {
        "day": "Tuesday",
        "startTime": "10:00",
        "endTime": "11:00",
        "subject": "Algorithms",
        "classSection": {
          "className": "CS-B",
          ...
        },
        ...
      }
    ],
    "classSections": [...],
    "timetables": [...]
  }
}
```

#### Student - Get Their Class Timetable

**Endpoint:** `GET /api/timetables`

**Response:** (200 OK)
```json
{
  "data": {
    "classSection": {
      "_id": "65def456...",
      "className": "CS-A",
      "classCode": "CSA001"
    },
    "timetables": [
      {
        "_id": "65timetable1...",
        "slots": [...]
      }
    ]
  }
}
```

### 3. Auto-Generate Timetables (Admin Only)

**Endpoint:** `POST /api/timetables/generate`

**Request Body:**
```json
{
  "academicYear": "2024-2025",
  "semester": "Fall 2024",
  "effectiveFrom": "2024-09-01",
  "effectiveTo": "2024-12-31"
}
```

**Optional - Generate for Specific Classes:**
```json
{
  "academicYear": "2024-2025",
  "semester": "Fall 2024",
  "effectiveFrom": "2024-09-01",
  "effectiveTo": "2024-12-31",
  "classSectionIds": ["65def456...", "65def789..."]
}
```

**Response:** (201 Created)
```json
{
  "message": "Successfully generated 5 timetable(s)",
  "data": {
    "timetables": [
      {
        "_id": "65timetable1...",
        "classSection": {...},
        "slots": [...]
      },
      ...
    ],
    "warnings": [
      "Could not assign all hours for CS-A - Machine Learning. Assigned 3/4 hours."
    ],
    "summary": {
      "total": 5,
      "generated": 5,
      "failed": 0
    }
  }
}
```

**Error Response - No Rooms:** (400 Bad Request)
```json
{
  "error": "No active rooms found. Please add rooms first."
}
```

### 4. Update a Timetable (Admin Only)

**Endpoint:** `PUT /api/timetables/65timetable1...`

**Request Body:** (only include fields to update)
```json
{
  "effectiveTo": "2024-11-30",
  "slots": [
    {
      "day": "Monday",
      "startTime": "09:00",
      "endTime": "10:00",
      "subject": "Data Structures",
      "teacher": "65teacher1...",
      "room": "65room3...",
      "sessionType": "theory"
    }
  ]
}
```

**Response:** (200 OK)
```json
{
  "message": "Timetable updated successfully",
  "data": {...}
}
```

### 5. Delete a Timetable (Admin Only)

**Endpoint:** `DELETE /api/timetables/65timetable1...`

**Response:** (200 OK)
```json
{
  "message": "Timetable deleted successfully"
}
```

## Testing Workflow

### Step 1: Setup Rooms
1. Login as admin
2. Create several rooms with different types:
   - At least 2-3 lab rooms
   - At least 3-4 theory classrooms
   - Vary seating capacities

### Step 2: Update Class Sections
Before generating timetables, update your class sections to use the new structure:

**Endpoint:** `PUT /api/class-sections/65def456...`

**Request Body:**
```json
{
  "subjects": [
    {
      "subject": "Data Structures",
      "teacher": "65teacher1...",
      "hoursPerWeek": 4,
      "sessionType": "theory"
    },
    {
      "subject": "Programming Lab",
      "teacher": "65teacher2...",
      "hoursPerWeek": 3,
      "sessionType": "lab"
    },
    {
      "subject": "Database Systems",
      "teacher": "65teacher3...",
      "hoursPerWeek": 3,
      "sessionType": "theory"
    }
  ],
  "theoryRoom": "65room1...",
  "labRoom": "65room2..."
}
```

### Step 3: Generate Timetables
1. Call the generate endpoint with current academic details
2. Check the response for any warnings
3. Review generated timetables

### Step 4: Verify Conflict Detection
Try to create a conflicting timetable manually:
1. Note a teacher's assigned slot
2. Try to assign the same teacher to another class at the same time
3. Should receive error message

### Step 5: Test Role-Based Access
1. Login as admin - should see all timetables
2. Login as teacher - should see aggregated personal schedule
3. Login as student - should see only their class timetable

## Common Error Codes

- **400 Bad Request** - Invalid input or conflict detected
- **401 Unauthorized** - Missing or invalid JWT token
- **403 Forbidden** - User doesn't have permission (e.g., non-admin trying to create)
- **404 Not Found** - Resource doesn't exist
- **500 Internal Server Error** - Server-side error

## Tips for Testing

1. **Start Small:** Create 2-3 rooms and 2-3 class sections first
2. **Check Conflicts:** The system will prevent double-booking teachers and rooms
3. **Review Warnings:** Auto-generation may warn if it couldn't assign all hours
4. **Verify Indexes:** Large datasets will benefit from the optimized indexes
5. **Test All Roles:** Make sure to test as admin, teacher, and student

## Postman Collection

You can import these examples into Postman or any API testing tool. Make sure to:
1. Set up environment variables for base URL and JWT token
2. Use the token from login response in Authorization header
3. Test error cases as well as success cases
