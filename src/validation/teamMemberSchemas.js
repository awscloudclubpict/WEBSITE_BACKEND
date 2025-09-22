import { z } from "zod";

export const createTeamMemberSchema = z.object({
    name: z.string().min(1, "Name is required"),
    role: z.string().min(1, "Role is required"),
    team: z.string().min(1, "Team is required"),
    githubLink: z.string().url().optional(),
    linkedinLink: z.string().url().optional(),
    profileImage: z.string().url().optional()
});

export const createTeamMemberWithImageSchema = z.object({
    name: z.string().min(1, "Name is required"),
    role: z.string().min(1, "Role is required"),
    team: z.string().min(1, "Team is required"),
    githubLink: z.string().url().optional(),
    linkedinLink: z.string().url().optional()
    // profileImage will be handled by multer and S3 upload
});

export const updateTeamMemberSchema = z.object({
    name: z.string().min(1, "Name is required").optional(),
    role: z.string().min(1, "Role is required").optional(),
    team: z.string().min(1, "Team is required").optional(),
    githubLink: z.string().url().optional(),
    linkedinLink: z.string().url().optional(),
    profileImage: z.string().url().optional()
});
