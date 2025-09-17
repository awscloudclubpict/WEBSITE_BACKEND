import { createEventSchema, updateEventSchema } from "../validation/eventSchemas.js";
import Event from "../models/Event.js";

class EventController {
    async createEvent(req, res) {
        if (req.user.role !== "admin") {
            return res.status(403).json({ error: "Access denied. Admins only." });
        }

        const result = createEventSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: result.error.errors });
        }

        const eventData = result.data;
        eventData.date = new Date(eventData.date); // Convert string to Date
        eventData.createdBy = req.user.email;

        try {
            const event = new Event(eventData);
            await event.save();
            res.status(201).json({ message: "Event created successfully", event });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(409).json({ error: "Event ID already exists" });
            }
            res.status(500).json({ error: "Internal server error" });
        }
    }

    async getEvents(req, res) {
        try {
            const events = await Event.find().sort({ date: 1 }); // Sort by date ascending
            res.json({ events });
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    }

    async getEventsByCategory(req, res) {
        const { type } = req.params;
        try {
            let query = {};
            if (type !== "all") {
                query.category = type.charAt(0).toUpperCase() + type.slice(1); // Capitalize, assuming "webinar" -> "Webinar"
            }
            const events = await Event.find(query).sort({ date: 1 });
            res.json({ events });
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    }

    async updateEvent(req, res) {
        const { event_id } = req.params;

        const event = await Event.findOne({ event_id });
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }

        if (req.user.role !== "admin" && event.createdBy !== req.user.email) {
            return res.status(403).json({ error: "Access denied." });
        }

        const result = updateEventSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: result.error.errors });
        }

        const updateData = result.data;
        if (updateData.date) {
            updateData.date = new Date(updateData.date);
        }

        try {
            const updatedEvent = await Event.findOneAndUpdate({ event_id }, updateData, { new: true });
            res.json({ message: "Event updated successfully", event: updatedEvent });
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    }

    async deleteEvent(req, res) {
        const { event_id } = req.params;

        const event = await Event.findOne({ event_id });
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }

        if (req.user.role !== "admin" && event.createdBy !== req.user.email) {
            return res.status(403).json({ error: "Access denied." });
        }

        try {
            await Event.findOneAndDelete({ event_id });
            res.json({ message: "Event deleted successfully" });
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    }
}

export default new EventController();
