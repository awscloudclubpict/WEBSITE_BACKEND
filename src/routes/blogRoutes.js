import express from "express";
import BlogController, { upload } from "../controllers/blogController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Existing routes
router.post("/create", authMiddleware, (req, res) => BlogController.addBlog(req, res));
router.get("/", (req, res) => BlogController.getAllBlogs(req, res));
router.get("/:id", (req, res) => BlogController.getBlogById(req, res));
router.put("/:id", authMiddleware, (req, res) => BlogController.updateBlog(req, res));
router.delete("/:id", authMiddleware, (req, res) => BlogController.deleteBlog(req, res));

// Debug endpoint to check JWT token
router.get("/debug-token", authMiddleware, (req, res) => {
    res.json({
        message: "Token is valid",
        user: req.user,
        role: req.user.role,
        email: req.user.email
    });
});

// Simple test endpoint (no auth required)
router.get("/test", (req, res) => {
    res.json({
        message: "Blog routes working correctly!",
        timestamp: new Date().toISOString(),
        endpoints: {
            createBlog: "POST /blogs/create",
            getBlogs: "GET /blogs",
            createBlogWithImage: "POST /blogs/create-with-image"
        }
    });
});

// New routes for S3 image upload
router.post("/create-with-image", authMiddleware, upload.fields([{ name: 'thumbnail_image', maxCount: 1 }, { name: 'author_profile_image', maxCount: 1 }]), (req, res) => BlogController.addBlogWithImage(req, res));
router.put("/:id/with-image", authMiddleware, upload.fields([{ name: 'thumbnail_image', maxCount: 1 }, { name: 'author_profile_image', maxCount: 1 }]), (req, res) => BlogController.updateBlogWithImage(req, res));

export default router;
