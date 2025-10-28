import Blog from '../models/blog.model.js';
import { uploadToS3, deleteFromS3 } from '../utils/s3.js';
import multer from 'multer';

// Configure multer for memory storage (for S3 upload)
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Export multer middleware for use in routes
export { upload };

const addBlog = async (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Access denied. Admins only." });
    }

    try {
        // Extract all fields including publish_date
        const { title, author_name, short_description, tags, author_profile_url, share_url, publish_date } = req.body;

        // Generate new blog_id
        const lastBlog = await Blog.findOne().sort({ blog_id: -1 }).exec();
        let newIdNumber = 1;
        if (lastBlog && lastBlog.blog_id) {
            const match = lastBlog.blog_id.match(/\d+$/);
            if (match) newIdNumber = parseInt(match[0], 10) + 1;
        }
        const newBlogId = `blog_${String(newIdNumber).padStart(3, "0")}`;

        let blogData = {
            blog_id: newBlogId, 
            title,
            author_name,
            short_description,
            tags: Array.isArray(tags) ? tags : (tags ? tags.split(',') : []), // Handle tags as array
            author_profile_url,
            publish_date: publish_date ? new Date(publish_date) : new Date(),
            share_url
        };

        // Handle thumbnail image upload
        if (req.files && req.files.thumbnail_image && req.files.thumbnail_image[0]) {
            try {
                const thumbnailUrl = await uploadToS3(
                    req.files.thumbnail_image[0].buffer,
                    req.files.thumbnail_image[0].originalname,
                    req.files.thumbnail_image[0].mimetype,
                    'blogs/thumbnails'
                );
                blogData.thumbnail_image_url = thumbnailUrl;
            } catch (uploadError) {
                return res.status(500).json({ error: "Failed to upload thumbnail image: " + uploadError.message });
            }
        }

        // Handle author profile image upload
        if (req.files && req.files.author_profile_image && req.files.author_profile_image[0]) {
            try {
                const profileUrl = await uploadToS3(
                    req.files.author_profile_image[0].buffer,
                    req.files.author_profile_image[0].originalname,
                    req.files.author_profile_image[0].mimetype,
                    'blogs/profiles'
                );
                blogData.author_profile_url = profileUrl;
            } catch (uploadError) {
                return res.status(500).json({ error: "Failed to upload author profile image: " + uploadError.message });
            }
        }

        const newBlog = new Blog(blogData);
        await newBlog.save();
        res.status(201).json({ message: "Blog created successfully", blog: newBlog });
    } catch (error) {
        console.error("Error adding blog:", error);
        if (error.code === 11000) {
            return res.status(409).json({ error: "Blog ID already exists" });
        }
        res.status(500).json({ error: "Failed to create blog", details: error.message });
    }
}

// Fetch all blogs
const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find().sort({ publish_date: -1 }); // newest first
        res.status(200).json(blogs);
    } catch (error) {
        console.error("Error fetching blogs:", error);
        res.status(500).json({ error: "Failed to fetch blogs", details: error.message });
    }
}

const getBlogById = async (req, res) => {
    try {
        const { id } = req.params;
        const blog = await Blog.findOne({ blog_id: id });

        if (!blog) {
            return res.status(404).json({ error: "Blog not found" });
        }

        res.status(200).json(blog);
    } catch (error) {
        console.error("Error fetching blog:", error);
        res.status(500).json({ error: "Failed to fetch blog", details: error.message });
    }
}

const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedBlog = await Blog.findOneAndDelete({ blog_id: id });

        if (!deletedBlog) {
            return res.status(404).json({ error: "Blog not found" });
        }

        // Delete images from S3 if they exist
        if (deletedBlog.thumbnail_image_url) {
            await deleteFromS3(deletedBlog.thumbnail_image_url);
        }
        if (deletedBlog.author_profile_url) {
            await deleteFromS3(deletedBlog.author_profile_url);
        }

        res.status(200).json({ message: "Blog deleted successfully", blog: deletedBlog });
    } catch (error) {
        console.error("Error deleting blog:", error);
        res.status(500).json({ error: "Failed to delete blog", details: error.message });
    }
}

// You can remove addBlogWithImage since addBlog already handles images
// Or keep it as an alternative that accepts manual blog_id

const updateBlogWithImage = async (req, res) => {
    res.status(501).json({ error: "Update with image not implemented yet" });
};

export default { 
    addBlog, 
    getAllBlogs, 
    getBlogById, 
    deleteBlog, 
    addBlogWithImage: addBlog, // alias if you want to keep the name
    updateBlogWithImage 
};