import express from "express";
import EventController, { upload } from "../controllers/eventController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// Existing routes - removed authMiddleware from GET routes to allow public access to view events
router.post("/create", authMiddleware, (req, res) => EventController.createEvent(req, res));
router.get("/", (req, res) => EventController.getEvents(req, res));
router.get("/category/:type", (req, res) => EventController.getEventsByCategory(req, res));
router.put("/:event_id", authMiddleware, (req, res) => EventController.updateEvent(req, res));
router.delete("/:event_id", authMiddleware, (req, res) => EventController.deleteEvent(req, res));

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
        message: "Server is running correctly!",
        timestamp: new Date().toISOString(),
        endpoints: {
            registerAdmin: "POST /auth/register/admin",
            debugToken: "GET /events/debug-token",
            createEventWithImage: "POST /events/create-with-image"
        }
    });
});

// New routes for S3 image upload
router.post("/create-with-image", authMiddleware, upload.single('banner_image_url'), (req, res) => EventController.createEventWithImage(req, res));
router.put("/:event_id/with-image", authMiddleware, upload.single('banner_image_url'), (req, res) => EventController.updateEventWithImage(req, res));

export default router;
