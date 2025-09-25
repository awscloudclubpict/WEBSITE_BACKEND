# Blog Image Upload Implementation

## Completed Tasks
- [x] Modified `src/controllers/blogController.js` to handle file uploads for thumbnail and author profile images
- [x] Added multer configuration for image uploads with 5MB limit and image-only filter
- [x] Integrated S3 upload functionality for blog images in 'blogs/thumbnails' and 'blogs/profiles' folders
- [x] Added admin-only access control to `addBlog` route using `authMiddleware`
- [x] Updated `deleteBlog` to automatically delete associated images from S3
- [x] Modified `src/index.js` to include multer middleware for blog routes
- [x] Updated `src/utils/s3.js` to use environment variables for AWS credentials
- [x] Ensured blog schema supports `thumbnail_image_url` and `author_profile_url`

## Key Features Implemented
- **File Uploads**: Supports uploading thumbnail image and author profile image via multipart/form-data
- **S3 Storage**: Images stored in AWS S3 with unique filenames in organized folders
- **Admin Protection**: Only users with admin role can create blogs
- **Automatic Cleanup**: Images deleted from S3 when blogs are deleted
- **Error Handling**: Comprehensive error handling for upload failures and validation

## API Usage
- **POST /addBlog**: Requires JWT token in Authorization header, accepts `thumbnail_image` and `author_profile_image` files, along with blog data in form fields
- **GET /blogs**: Public access to retrieve all blogs
- **GET /blogs/:id**: Public access to retrieve specific blog by ID
- **DELETE /blogs/:id**: Admin-only deletion of blogs with automatic S3 cleanup

## Environment Variables Required
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_REGION`
- `AWS_S3_BUCKET_NAME`
- `JWT_SECRET`
- `MONGO_URI`

## Testing
- Start server with `node src/index.js`
- Use Postman to test blog creation with file uploads (requires admin JWT token)
- Verify images are uploaded to S3 and URLs are saved in database
- Test blog deletion to ensure images are removed from S3
