# WEBSITE BACKEND API ROUTES DOCUMENTATION

Base URL: https://website-backend-lkns.onrender.com/

This document provides complete API documentation with request parameters, response formats, and authentication requirements for all GET and POST routes.

## General Routes

### GET /iamatharva
**Description:** API status check endpoint

**Authentication:** None required

**Request Parameters:** None

**Response (Success - 200):**
```json
{
  "message": "API is running!",
  "status": "success"
}
```

### GET /test
**Description:** Test endpoint

**Authentication:** None required

**Request Parameters:** None

**Response (Success - 200):**
```json
{
  "message": "Test endpoint working!",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Authentication Routes (/auth)

### POST /auth/register/student
**Description:** Register as a student

**Authentication:** None required

**Request Parameters (JSON):**
```json
{
  "fullName": "string (min 3 chars)",
  "email": "string (valid email)",
  "password": "string (min 6 chars)",
  "confirmPassword": "string (must match password)",
  "mobileNumber": "string (min 10 chars)",
  "collegeName": "string (min 2 chars)",
  "branch": "string (min 2 chars)",
  "yearOfStudy": "number (1-4)"
}
```

**Response (Success - 201):**
```json
{
  "token": "jwt_token_string"
}
```

**Response (Error - 400):**
```json
{
  "error": [
    {
      "code": "invalid_type",
      "message": "Required",
      "path": ["field_name"]
    }
  ]
}
```

**Response (Error - 409):**
```json
{
  "error": "User already exists"
}
```

### POST /auth/register/professional
**Description:** Register as a working professional

**Authentication:** None required

**Request Parameters (JSON):**
```json
{
  "fullName": "string (min 3 chars)",
  "email": "string (valid email)",
  "password": "string (min 6 chars)",
  "confirmPassword": "string (must match password)",
  "mobileNumber": "string (min 10 chars)",
  "companyName": "string (min 2 chars)"
}
```

**Response (Success - 201):**
```json
{
  "token": "jwt_token_string"
}
```

**Response (Error - 400/409):** Same as student registration

### POST /auth/register/admin
**Description:** Register as an admin

**Authentication:** None required

**Request Parameters (JSON):**
```json
{
  "fullName": "string (min 3 chars)",
  "email": "string (valid email)",
  "password": "string (min 6 chars)",
  "mobileNumber": "string (min 10 chars)",
  "companyName": "string (min 2 chars)"
}
```

**Response (Success - 201):**
```json
{
  "token": "jwt_token_string"
}
```

**Response (Error - 400/409):** Same as above

### POST /auth/login
**Description:** Login for all user types

**Authentication:** None required

**Request Parameters (JSON):**
```json
{
  "email": "string (valid email)",
  "password": "string (min 6 chars)"
}
```

**Response (Success - 200):**
```json
{
  "token": "jwt_token_string",
  "fullName": "User Full Name",
  "email": "user@example.com"
}
```

**Response (Error - 400):**
```json
{
  "error": [
    {
      "code": "invalid_type",
      "message": "Required",
      "path": ["email"]
    }
  ]
}
```

**Response (Error - 401):**
```json
{
  "error": "Invalid credentials"
}
```

### POST /auth/logout
**Description:** Logout user

**Authentication:** None required (clears cookie)

**Request Parameters:** None

**Response (Success - 200):**
```json
{
  "message": "Logged out"
}
```

## Event Routes (/events)

### GET /events/
**Description:** Get all events

**Authentication:** Required (JWT token)

**Request Parameters:** None

**Response (Success - 200):**
```json
{
  "events": [
    {
      "event_id": "unique_event_id",
      "title": "Event Title",
      "description": "Event description",
      "date": "2024-01-01T00:00:00.000Z",
      "time": "10:00 AM",
      "venue": "Event Venue",
      "mode": "Offline",
      "status": "Upcoming",
      "category": "Workshop",
      "registration_link": "https://example.com/register",
      "banner_image_url": "https://s3.amazonaws.com/bucket/image.jpg",
      "createdBy": "admin@example.com"
    }
  ]
}
```

### GET /events/category/:type
**Description:** Get events by category

**Authentication:** Required (JWT token)

**Request Parameters:**
- `type` (URL parameter): Category type (e.g., "workshop", "webinar", "all")

**Response (Success - 200):**
```json
{
  "events": [
    {
      "event_id": "unique_event_id",
      "title": "Event Title",
      "description": "Event description",
      "date": "2024-01-01T00:00:00.000Z",
      "time": "10:00 AM",
      "venue": "Event Venue",
      "mode": "Offline",
      "status": "Upcoming",
      "category": "Workshop",
      "registration_link": "https://example.com/register",
      "banner_image_url": "https://s3.amazonaws.com/bucket/image.jpg",
      "createdBy": "admin@example.com"
    }
  ]
}
```

### GET /events/debug-token
**Description:** Debug JWT token validation

**Authentication:** Required (JWT token)

**Request Parameters:** None

**Response (Success - 200):**
```json
{
  "message": "Token is valid",
  "user": {
    "email": "user@example.com",
    "role": "admin"
  },
  "role": "admin",
  "email": "user@example.com"
}
```

### GET /events/test
**Description:** Test events endpoint

**Authentication:** None required

**Request Parameters:** None

**Response (Success - 200):**
```json
{
  "message": "Server is running correctly!",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "endpoints": {
    "registerAdmin": "POST /auth/register/admin",
    "debugToken": "GET /events/debug-token",
    "createEventWithImage": "POST /events/create-with-image"
  }
}
```

### POST /events/create
**Description:** Create a new event

**Authentication:** Required (Admin only)

**Request Parameters (JSON):**
```json
{
  "event_id": "string (required, unique)",
  "title": "string (required)",
  "description": "string (required)",
  "date": "string (required, valid date format)",
  "time": "string (optional)",
  "venue": "string (required)",
  "mode": "enum: 'Offline' | 'Online' | 'Hybrid'",
  "status": "enum: 'Upcoming' | 'Ongoing' | 'Past'",
  "category": "string (required)",
  "registration_link": "string (optional, valid URL)",
  "banner_image_url": "string (optional, valid URL)"
}
```

**Response (Success - 201):**
```json
{
  "message": "Event created successfully",
  "event": {
    "event_id": "unique_event_id",
    "title": "Event Title",
    "description": "Event description",
    "date": "2024-01-01T00:00:00.000Z",
    "time": "10:00 AM",
    "venue": "Event Venue",
    "mode": "Offline",
    "status": "Upcoming",
    "category": "Workshop",
    "registration_link": "https://example.com/register",
    "banner_image_url": "https://s3.amazonaws.com/bucket/image.jpg",
    "createdBy": "admin@example.com"
  }
}
```

**Response (Error - 403):**
```json
{
  "error": "Access denied. Admins only."
}
```

**Response (Error - 409):**
```json
{
  "error": "Event ID already exists"
}
```

### POST /events/create-with-image
**Description:** Create event with image upload

**Authentication:** Required (Admin only)

**Request Parameters (Form-data):**
- `event_id`: string (required, unique)
- `title`: string (required)
- `description`: string (required)
- `date`: string (required, valid date format)
- `time`: string (optional)
- `venue`: string (required)
- `mode`: enum ('Offline', 'Online', 'Hybrid')
- `status`: enum ('Upcoming', 'Ongoing', 'Past')
- `category`: string (required)
- `registration_link`: string (optional, valid URL)
- `banner_image_url`: file (optional, image file)

**Response (Success - 201):**
```json
{
  "message": "Event created successfully with image",
  "event": {
    "event_id": "unique_event_id",
    "title": "Event Title",
    "description": "Event description",
    "date": "2024-01-01T00:00:00.000Z",
    "time": "10:00 AM",
    "venue": "Event Venue",
    "mode": "Offline",
    "status": "Upcoming",
    "category": "Workshop",
    "registration_link": "https://example.com/register",
    "banner_image_url": "https://s3.amazonaws.com/bucket/image.jpg",
    "createdBy": "admin@example.com"
  }
}
```

## Blog Routes (/blogs)

### GET /blogs/
**Description:** Get all blogs

**Authentication:** None required

**Request Parameters:** None

**Response (Success - 200):**
```json
[
  {
    "blog_id": "unique_blog_id",
    "title": "Blog Title",
    "author_name": "Author Name",
    "short_description": "Short description",
    "tags": ["tag1", "tag2"],
    "share_url": "https://example.com/share",
    "publish_date": "2024-01-01T00:00:00.000Z",
    "thumbnail_image_url": "https://s3.amazonaws.com/bucket/thumbnail.jpg",
    "author_profile_url": "https://s3.amazonaws.com/bucket/profile.jpg"
  }
]
```

### GET /blogs/:id
**Description:** Get blog by ID

**Authentication:** None required

**Request Parameters:**
- `id` (URL parameter): Blog ID

**Response (Success - 200):**
```json
{
  "blog_id": "unique_blog_id",
  "title": "Blog Title",
  "author_name": "Author Name",
  "short_description": "Short description",
  "tags": ["tag1", "tag2"],
  "share_url": "https://example.com/share",
  "publish_date": "2024-01-01T00:00:00.000Z",
  "thumbnail_image_url": "https://s3.amazonaws.com/bucket/thumbnail.jpg",
  "author_profile_url": "https://s3.amazonaws.com/bucket/profile.jpg"
}
```

**Response (Error - 404):**
```json
{
  "error": "Blog not found"
}
```

### GET /blogs/debug-token
**Description:** Debug JWT token validation

**Authentication:** Required (JWT token)

**Request Parameters:** None

**Response (Success - 200):**
```json
{
  "message": "Token is valid",
  "user": {
    "email": "user@example.com",
    "role": "admin"
  },
  "role": "admin",
  "email": "user@example.com"
}
```

### GET /blogs/test
**Description:** Test blogs endpoint

**Authentication:** None required

**Request Parameters:** None

**Response (Success - 200):**
```json
{
  "message": "Blog routes working correctly!",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "endpoints": {
    "createBlog": "POST /blogs/create",
    "getBlogs": "GET /blogs",
    "createBlogWithImage": "POST /blogs/create-with-image"
  }
}
```

### POST /blogs/create
**Description:** Create a new blog

**Authentication:** Required (Admin only)

**Request Parameters (JSON):**
```json
{
  "blog_id": "string (required, unique)",
  "title": "string (required)",
  "author_name": "string (required)",
  "short_description": "string (optional)",
  "tags": ["array of strings (optional)"],
  "share_url": "string (optional, valid URL)",
  "publish_date": "string (optional, valid date format)"
}
```

**Response (Success - 201):**
```json
{
  "message": "Blog created successfully",
  "blog": {
    "blog_id": "unique_blog_id",
    "title": "Blog Title",
    "author_name": "Author Name",
    "short_description": "Short description",
    "tags": ["tag1", "tag2"],
    "share_url": "https://example.com/share",
    "publish_date": "2024-01-01T00:00:00.000Z",
    "thumbnail_image_url": "https://s3.amazonaws.com/bucket/thumbnail.jpg",
    "author_profile_url": "https://s3.amazonaws.com/bucket/profile.jpg"
  }
}
```

**Response (Error - 403):**
```json
{
  "error": "Access denied. Admins only."
}
```

**Response (Error - 409):**
```json
{
  "error": "Blog ID already exists"
}
```

### POST /blogs/create-with-image
**Description:** Create blog with image uploads

**Authentication:** Required (Admin only)

**Request Parameters (Form-data):**
- `blog_id`: string (required, unique)
- `title`: string (required)
- `author_name`: string (required)
- `short_description`: string (optional)
- `tags`: array of strings (optional)
- `share_url`: string (optional, valid URL)
- `publish_date`: string (optional, valid date format)
- `thumbnail_image`: file (optional, image file)
- `author_profile_image`: file (optional, image file)

**Response (Success - 201):** Same as /blogs/create

## Team Member Routes (/team-members)

### GET /team-members/
**Description:** Get all team members

**Authentication:** None required

**Request Parameters:**
- `team` (query parameter, optional): Filter by team name

**Response (Success - 200):**
```json
{
  "teamMembers": [
    {
      "_id": "mongodb_object_id",
      "name": "Team Member Name",
      "role": "Team Role",
      "team": "Core",
      "githubLink": "https://github.com/username",
      "linkedinLink": "https://linkedin.com/in/username",
      "profileImage": "https://s3.amazonaws.com/bucket/profile.jpg",
      "createdBy": "admin@example.com"
    }
  ]
}
```

### GET /team-members/core
**Description:** Get core team members

**Authentication:** None required

**Request Parameters:** None

**Response (Success - 200):**
```json
{
  "teamMembers": [
    {
      "_id": "mongodb_object_id",
      "name": "Team Member Name",
      "role": "Team Role",
      "team": "Core",
      "githubLink": "https://github.com/username",
      "linkedinLink": "https://linkedin.com/in/username",
      "profileImage": "https://s3.amazonaws.com/bucket/profile.jpg",
      "createdBy": "admin@example.com"
    }
  ]
}
```

### GET /team-members/tech-team
**Description:** Get tech team members

**Authentication:** None required

**Request Parameters:** None

**Response (Success - 200):** Same format as above, filtered for "Tech Team"

### GET /team-members/web-dev
**Description:** Get web development team members

**Authentication:** None required

**Request Parameters:** None

**Response (Success - 200):** Same format as above, filtered for "Web Dev"

### GET /team-members/event-management
**Description:** Get event management team members

**Authentication:** None required

**Request Parameters:** None

**Response (Success - 200):** Same format as above, filtered for "Event Management"

### GET /team-members/design
**Description:** Get design team members

**Authentication:** None required

**Request Parameters:** None

**Response (Success - 200):** Same format as above, filtered for "Design"

### GET /team-members/social-media
**Description:** Get social media team members

**Authentication:** None required

**Request Parameters:** None

**Response (Success - 200):** Same format as above, filtered for "Social Media"

### GET /team-members/documentation
**Description:** Get documentation team members

**Authentication:** None required

**Request Parameters:** None

**Response (Success - 200):** Same format as above, filtered for "Documentation"

### GET /team-members/tech-blog
**Description:** Get tech blog team members

**Authentication:** None required

**Request Parameters:** None

**Response (Success - 200):** Same format as above, filtered for "Tech+Blog"

### POST /team-members/
**Description:** Create a new team member

**Authentication:** Required (Admin only)

**Request Parameters (JSON):**
```json
{
  "name": "string (required)",
  "role": "string (required)",
  "team": "string (required)",
  "githubLink": "string (optional, valid URL)",
  "linkedinLink": "string (optional, valid URL)",
  "profileImage": "string (optional, valid URL)"
}
```

**Response (Success - 201):**
```json
{
  "message": "Team member created successfully",
  "teamMember": {
    "_id": "mongodb_object_id",
    "name": "Team Member Name",
    "role": "Team Role",
    "team": "Core",
    "githubLink": "https://github.com/username",
    "linkedinLink": "https://linkedin.com/in/username",
    "profileImage": "https://s3.amazonaws.com/bucket/profile.jpg",
    "createdBy": "admin@example.com"
  }
}
```

**Response (Error - 403):**
```json
{
  "error": "Access denied. Admins only."
}
```

### POST /team-members/create-with-image
**Description:** Create team member with image upload

**Authentication:** Required (Admin only)

**Request Parameters (Form-data):**
- `name`: string (required)
- `role`: string (required)
- `team`: string (required)
- `githubLink`: string (optional, valid URL)
- `linkedinLink`: string (optional, valid URL)
- `profile_image`: file (optional, image file)

**Response (Success - 201):**
```json
{
  "message": "Team member created successfully with image",
  "teamMember": {
    "_id": "mongodb_object_id",
    "name": "Team Member Name",
    "role": "Team Role",
    "team": "Core",
    "githubLink": "https://github.com/username",
    "linkedinLink": "https://linkedin.com/in/username",
    "profileImage": "https://s3.amazonaws.com/bucket/profile.jpg",
    "createdBy": "admin@example.com"
  }
}
```

## Profile Route

### GET /profile
**Description:** Get user profile information

**Authentication:** Required (JWT token)

**Request Parameters:** None

**Response (Success - 200):**
```json
{
  "message": "Hello, user@example.com, Role: admin"
}
```

---

## Common Error Responses

### 400 Bad Request (Validation Error)
```json
{
  "error": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "number",
      "path": ["field_name"],
      "message": "Expected string, received number"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "error": "Invalid credentials"
}
```

### 403 Forbidden
```json
{
  "error": "Access denied. Admins only."
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 409 Conflict
```json
{
  "error": "Resource already exists"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

## Authentication Notes

- JWT tokens are required for protected routes
- Tokens are sent in cookies automatically after login
- Admin role is required for create/update/delete operations
- Student and Professional roles have limited access
- Tokens expire and require re-login

## File Upload Notes

- Image uploads are limited to 5MB per file
- Supported formats: JPEG, PNG, GIF, WebP
- Images are uploaded to AWS S3 and URLs are returned
- Form-data is required for endpoints with file uploads
