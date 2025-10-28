import express from "express";
import EventController, { upload } from "../controllers/eventController.js";
// import { authMiddleware } from "../middleware/authMiddleware.js"; // Removed authMiddleware import

const router = express.Router();

// Existing routes - removed authMiddleware from all routes
router.post("/create", (req, res) => EventController.createEvent(req, res));
router.get("/", (req, res) => EventController.getEvents(req, res));
router.get("/category/:type", (req, res) => EventController.getEventsByCategory(req, res));
router.put("/:event_id", (req, res) => EventController.updateEvent(req, res));
router.delete("/:event_id", (req, res) => EventController.deleteEvent(req, res));

// Debug endpoint to check JWT token - removed authMiddleware
router.get("/debug-token", (req, res) => {
    res.json({
        message: "Token debug endpoint - auth middleware removed",
        timestamp: new Date().toISOString()
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

// New routes for S3 image upload - removed authMiddleware
router.post("/create-with-image", upload.single('banner_image_url'), (req, res) => EventController.createEventWithImage(req, res));
router.put("/:event_id/with-image", upload.single('banner_image_url'), (req, res) => EventController.updateEventWithImage(req, res));

export default router;
