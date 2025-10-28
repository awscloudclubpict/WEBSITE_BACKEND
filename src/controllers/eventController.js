import { createEventSchema, createEventWithImageSchema, updateEventSchema } from "../validation/eventSchemas.js";
import Event from "../models/Event.js";
import { uploadToS3, deleteFromS3 } from "../utils/s3.js";
import multer from "multer";

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

class EventController {
    async createEvent(req, res) {
        console.log("Creating event with data:", req.body);
        const result = createEventSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: result.error.errors });
        }

        let eventData = result.data;
        eventData.date = new Date(eventData.date); // Convert string to Date
        eventData.createdBy = "admin"; // Default since no auth

        // Handle image upload if file is provided
        if (req.file) {
            try {
                const imageUrl = await uploadToS3(
                    req.file.buffer,
                    req.file.originalname,
                    req.file.mimetype
                );
                eventData.banner_image_url = imageUrl;
            } catch (uploadError) {
                return res.status(500).json({ error: "Failed to upload image: " + uploadError.message });
            }
        }

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

    // Create event with image upload to S3
    async createEventWithImage(req, res) {
        console.log("Creating event with image, data:", req.body);
        try {
            const result = createEventWithImageSchema.safeParse(req.body);
            if (!result.success) {
                return res.status(400).json({ error: result.error.errors });
            }

            let eventData = result.data;
            eventData.date = new Date(eventData.date); // Convert string to Date
            eventData.createdBy = "admin"; // Default since no auth

            // Handle image upload if file is provided
            if (req.file) {
                try {
                    const imageUrl = await uploadToS3(
                        req.file.buffer,
                        req.file.originalname,
                        req.file.mimetype
                    );
                    eventData.banner_image_url = imageUrl;
                } catch (uploadError) {
                    return res.status(500).json({ error: "Failed to upload image: " + uploadError.message });
                }
            }

            const event = new Event(eventData);
            await event.save();

            res.status(201).json({
                message: "Event created successfully with image",
                event: {
                    ...event.toObject(),
                    banner_image_url: eventData.banner_image_url
                }
            });
        } catch (error) {
            if (error.code === 11000) {
                return res.status(409).json({ error: "Event ID already exists" });
            }
            res.status(500).json({ error: "Internal server error: " + error.message });
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

        // Removed auth check since no auth middleware

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

    // Update event with image upload to S3
    async updateEventWithImage(req, res) {
        const { event_id } = req.params;

        const event = await Event.findOne({ event_id });
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }

        // Removed auth check since no auth middleware

        try {
            const result = updateEventSchema.safeParse(req.body);
            if (!result.success) {
                return res.status(400).json({ error: result.error.errors });
            }

            let updateData = result.data;
            if (updateData.date) {
                updateData.date = new Date(updateData.date);
            }

            // Handle image upload if file is provided
            if (req.file) {
                try {
                    // Delete old image from S3 if it exists
                    if (event.banner_image_url) {
                        await deleteFromS3(event.banner_image_url);
                    }

                    // Upload new image to S3
                    const imageUrl = await uploadToS3(
                        req.file.buffer,
                        req.file.originalname,
                        req.file.mimetype
                    );
                    updateData.banner_image_url = imageUrl;
                } catch (uploadError) {
                    return res.status(500).json({ error: "Failed to upload image: " + uploadError.message });
                }
            }

            const updatedEvent = await Event.findOneAndUpdate({ event_id }, updateData, { new: true });

            res.json({
                message: "Event updated successfully with image",
                event: updatedEvent
            });
        } catch (error) {
            res.status(500).json({ error: "Internal server error: " + error.message });
        }
    }

    async deleteEvent(req, res) {
        const { event_id } = req.params;

        const event = await Event.findOne({ event_id });
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }

        // Removed auth check since no auth middleware

        try {
            // Delete image from S3 if it exists
            if (event.banner_image_url) {
                await deleteFromS3(event.banner_image_url);
            }

            await Event.findOneAndDelete({ event_id });
            res.json({ message: "Event deleted successfully" });
        } catch (error) {
            res.status(500).json({ error: "Internal server error" });
        }
    }
}

export default new EventController();
