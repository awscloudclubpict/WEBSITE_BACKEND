

import { z } from 'zod';

// Common fields
const commonFields = {
    fullName: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string().min(6),
    mobileNumber: z.string().min(10),
};

// Student Schema
export const studentRegisterSchema = z
    .object({
        ...commonFields,
        collegeName: z.string().min(2),
        branch: z.string().min(2),
        yearOfStudy: z.number().int().min(1),
    })
    .refine(data => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

// Professional Schema
export const professionalRegisterSchema = z
    .object({
        ...commonFields,
        companyName: z.string().min(2),
    })
    .refine(data => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

// Login Schema
export const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});
