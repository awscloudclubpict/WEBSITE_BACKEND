import bcrypt from "bcryptjs";
import {
    studentRegisterSchema,
    professionalRegisterSchema,
    adminRegisterSchema,
    loginSchema
} from "../validation/authSchemas.js";
import UserSchema from "../models/User.js";

class AuthController {
    async registerStudent(req, res) {
        console.log("Registering student with data:", req.body);
        const result = studentRegisterSchema.safeParse(req.body);
        if (!result.success) {
            console.log("Validation failed for student registration:", result.error.errors);
            return res.status(400).json({ error: result.error.errors });
        }

        const { fullName, email, password, mobileNumber, collegeName, branch, yearOfStudy } = result.data;

        const existingUser = await UserSchema.findOne({ email });
        if (existingUser) {
            console.log("User already exists:", email);
            return res.status(409).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new UserSchema({
            fullName,
            email,
            password: hashedPassword,
            mobileNumber,
            collegeName,
            branch,
            yearOfStudy,
            role: "student"
        });

        await user.save();
        console.log("Student registered successfully:", user.email);

        // Return the entire user object without password
        const userResponse = user.toObject();
        delete userResponse.password;
        res.json({ user: userResponse });
    }

    async registerProfessional(req, res) {
        console.log("Registering professional with data:", req.body);
        const result = professionalRegisterSchema.safeParse(req.body);
        if (!result.success) {
            console.log("Validation failed for professional registration:", result.error.errors);
            return res.status(400).json({ error: result.error.errors });
        }

        const { fullName, email, password, mobileNumber, companyName } = result.data;

        const existingUser = await UserSchema.findOne({ email });
        if (existingUser) {
            console.log("User already exists:", email);
            return res.status(409).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new UserSchema({
            fullName,
            email,
            password: hashedPassword,
            mobileNumber,
            companyName,
            role: "professional"
        });

        await user.save();
        console.log("Professional registered successfully:", user.email);

        // Return the entire user object without password
        const userResponse = user.toObject();
        delete userResponse.password;
        res.json({ user: userResponse });
    }

    async registerAdmin(req, res) {
        console.log("Registering admin with data:", req.body);
        const result = adminRegisterSchema.safeParse(req.body);
        if (!result.success) {
            console.log("Validation failed for admin registration:", result.error.errors);
            return res.status(400).json({ error: result.error.errors });
        }

        const { fullName, email, password, mobileNumber, companyName } = result.data;

        const existingUser = await UserSchema.findOne({ email });
        if (existingUser) {
            console.log("User already exists:", email);
            return res.status(409).json({ error: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new UserSchema({
            fullName,
            email,
            password: hashedPassword,
            mobileNumber,
            companyName,
            role: "admin"
        });

        await user.save();
        console.log("Admin registered successfully:", user.email);

        // Return the entire user object without password
        const userResponse = user.toObject();
        delete userResponse.password;
        res.json({ user: userResponse });
    }

    async login(req, res) {
        console.log("Login attempt for email:", req.body.email);
        const result = loginSchema.safeParse(req.body);
        if (!result.success) {
            console.log("Validation failed for login:", result.error.errors);
            return res.status(400).json({ error: result.error.errors });
        }

        const { email, password } = result.data;

        const user = await UserSchema.findOne({ email });
        if (!user) {
            console.log("User not found:", email);
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            console.log("Invalid password for user:", email);
            return res.status(401).json({ error: "Invalid credentials" });
        }

        console.log("Login successful for user:", user.email);

        // Return the entire user object without password
        const userResponse = user.toObject();
        delete userResponse.password;
        res.json({ user: userResponse });
    }
}

export default new AuthController();
