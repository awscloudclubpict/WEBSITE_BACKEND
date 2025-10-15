import Blog from "../models/blog.model.js";
import {blogValidationSchema} from "../validation/blogValidationSchema.js";
import { uploadToS3, deleteFromS3 } from "../utils/s3.js";
import multer from "multer";

// Configure multer for memory storage (for S3 upload)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only image files are allowed!"), false);
        }
    },
});

// Export multer middleware
export { upload };

class BlogController {
    // Create Blog (with image upload)
    async createBlog(req, res) {
        try {
            const { title, author_name, short_description, tags, author_profile_url, share_url } = req.body;

            let imageUrl = "";
            if (req.file) {
                try {
                    imageUrl = await uploadToS3(
                        req.file.buffer,
                        req.file.originalname,
                        req.file.mimetype,
                        "blogs"
                    );
                } catch (uploadError) {
                    return res.status(500).json({
                        error: "Image upload failed",
                        details: uploadError.message,
                    });
                }
            }

            // Validate input data
            const validationResult = blogValidationSchema.safeParse({
                title,
                author_name,
                short_description,
                tags: typeof tags === "string" ? JSON.parse(tags) : tags,
                author_profile_url,
                share_url,
                thumbnail_image_url: imageUrl,
            });

            if (!validationResult.success) {
                return res.status(400).json({
                    error: "Validation failed",
                    details: validationResult.error.errors,
                });
            }

            // Generate new blog_id
            const lastBlog = await Blog.findOne().sort({ blog_id: -1 }).exec();
            let newIdNumber = 1;
            if (lastBlog && lastBlog.blog_id) {
                const match = lastBlog.blog_id.match(/\d+$/);
                if (match) newIdNumber = parseInt(match[0], 10) + 1;
            }
            const newBlogId = `blog_${String(newIdNumber).padStart(3, "0")}`;

            const newBlog = new Blog({
                ...validationResult.data,
                blog_id: newBlogId,
            });

            await newBlog.save();
            res.status(201).json({ message: "Blog created successfully", blog: newBlog });
        } catch (error) {
            console.error("Error adding blog:", error.message);
            res.status(500).json({ error: "Failed to create blog", details: error.message });
        }
    }

    // Get all blogs
    async getAllBlogs(req, res) {
        try {
            const blogs = await Blog.find().sort({ publish_date: -1 });
            res.status(200).json(blogs);
        } catch (error) {
            console.error("Error fetching blogs:", error.message);
            res.status(500).json({ error: "Failed to fetch blogs", details: error.message });
        }
    }

    // Get blog by ID
    async getBlogById(req, res) {
        try {
            const { id } = req.params;
            const blog = await Blog.findOne({ blog_id: id });

            if (!blog) {
                return res.status(404).json({ error: "Blog not found" });
            }

            res.status(200).json(blog);
        } catch (error) {
            console.error("Error fetching blog:", error.message);
            res.status(500).json({ error: "Failed to fetch blog", details: error.message });
        }
    }

    // Get blogs by tag
    async getBlogsByTag(req, res) {
        try {
            const { tag } = req.params;
            const blogs = await Blog.find({ tags: tag });

            if (!blogs || blogs.length === 0) {
                return res.status(404).json({ error: "No blogs found with this tag" });
            }

            res.status(200).json(blogs);
        } catch (error) {
            console.error("Error fetching blogs by tag:", error.message);
            res.status(500).json({
                error: "Failed to fetch blogs by tag",
                details: error.message,
            });
        }
    }

    // Delete blog
    async deleteBlog(req, res) {
        try {
            const { id } = req.params;

            const blog = await Blog.findOne({ blog_id: id });
            if (!blog) {
                return res.status(404).json({ error: "Blog not found" });
            }

            // Delete thumbnail image from S3 if it exists
            if (blog.thumbnail_image_url) {
                try {
                    await deleteFromS3(blog.thumbnail_image_url);
                } catch (s3Error) {
                    console.warn("Failed to delete image from S3:", s3Error.message);
                }
            }

            await Blog.deleteOne({ blog_id: id });
            res.status(200).json({ message: "Blog deleted successfully", blog });
        } catch (error) {
            console.error("Error deleting blog:", error.message);
            res.status(500).json({ error: "Failed to delete blog", details: error.message });
        }
    }
}

export default new BlogController();
