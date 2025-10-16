import { z } from "zod";

export const createBlogSchema = z.object({
    blog_id: z.string().min(1, "Blog ID is required"),
    title: z.string().min(1, "Title is required"),
    author_name: z.string().min(1, "Author name is required"),
    short_description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    share_url: z.string().url().optional(),
    publish_date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date format").optional()
});

// Schema for blog creation with file upload (excludes image URLs from validation)
export const createBlogWithImageSchema = z.object({
    blog_id: z.string().min(1, "Blog ID is required"),
    title: z.string().min(1, "Title is required"),
    author_name: z.string().min(1, "Author name is required"),
    short_description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    share_url: z.string().url().optional(),
    publish_date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date format").optional()
});

export const updateBlogSchema = z.object({
    title: z.string().min(1, "Title is required").optional(),
    author_name: z.string().min(1, "Author name is required").optional(),
    short_description: z.string().optional(),
    tags: z.array(z.string()).optional(),
    share_url: z.string().url().optional(),
    publish_date: z.string().refine((val) => !isNaN(Date.parse(val)), "Invalid date format").optional()
});
