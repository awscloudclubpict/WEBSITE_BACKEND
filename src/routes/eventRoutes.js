import express from "express";
import EventController from "../controllers/eventController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create", authMiddleware, (req, res) => EventController.createEvent(req, res));
router.get("/", authMiddleware, (req, res) => EventController.getEvents(req, res));
router.get("/category/:type", authMiddleware, (req, res) => EventController.getEventsByCategory(req, res));
router.put("/:event_id", authMiddleware, (req, res) => EventController.updateEvent(req, res));
router.delete("/:event_id", authMiddleware, (req, res) => EventController.deleteEvent(req, res));

export default router;
