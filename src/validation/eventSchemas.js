import { z } from "zod";

export const createEventSchema = z.object({
    event_id: z.string().min(1, "Event ID is required"),
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date format"),
    time: z.string().optional(),
    venue: z.string().min(1, "Venue is required"),
    mode: z.enum(["Offline", "Online", "Hybrid"]),
    status: z.enum(["Upcoming", "Ongoing", "Past"]),
    category: z.string().min(1, "Category is required"),
    registration_link: z.string().url().optional(),
    banner_image_url: z.string().url().optional()
});

export const updateEventSchema = z.object({
    title: z.string().min(1, "Title is required").optional(),
    description: z.string().min(1, "Description is required").optional(),
    date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date format").optional(),
    time: z.string().optional(),
    venue: z.string().min(1, "Venue is required").optional(),
    mode: z.enum(["Offline", "Online", "Hybrid"]).optional(),
    status: z.enum(["Upcoming", "Ongoing", "Past"]).optional(),
    category: z.string().min(1, "Category is required").optional(),
    registration_link: z.string().url().optional(),
    banner_image_url: z.string().url().optional()
});
