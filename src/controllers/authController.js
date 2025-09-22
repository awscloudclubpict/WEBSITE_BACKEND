import bcrypt from "bcryptjs";
import {
    studentRegisterSchema,
    professionalRegisterSchema,
    adminRegisterSchema,
    loginSchema
} from "../validation/authSchemas.js";
import { generateToken } from "../utils/jwt.js";
import UserSchema from "../models/User.js";

class AuthController {
    async registerStudent(req, res) {
        const result = studentRegisterSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: result.error.errors });
        }

        const { fullName, email, password, mobileNumber, collegeName, branch, yearOfStudy } = result.data;

        const existingUser = await UserSchema.findOne({ email });
        if (existingUser) {
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

        const token = generateToken({ email, role: "student" });
        res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'lax' });
        res.json({ token });
    }

    async registerProfessional(req, res) {
        const result = professionalRegisterSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: result.error.errors });
        }

        const { fullName, email, password, mobileNumber, companyName } = result.data;

        const existingUser = await UserSchema.findOne({ email });
        if (existingUser) {
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

        const token = generateToken({ email, role: "professional" });
        res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'lax' });
        res.json({ token });
    }

    async registerAdmin(req, res) {
        const result = adminRegisterSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: result.error.errors });
        }

        const { fullName, email, password, mobileNumber, companyName } = result.data;

        const existingUser = await UserSchema.findOne({ email });
        if (existingUser) {
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

        const token = generateToken({ email, role: "admin" });
        res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'lax' });
        res.json({ token });
    }

    async login(req, res) {
        const result = loginSchema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: result.error.errors });
        }

        const { email, password } = result.data;

        const user = await UserSchema.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const valid = await bcrypt.compare(password, user.password);
        if (!valid) {
            return res.status(401).json({ error: "Invalid credentials" });
        }

        const token = generateToken({ email, role: user.role });
        res.cookie('token', token, { httpOnly: true, secure: false, sameSite: 'lax' });
        res.json({ token, fullName: user.fullName, email: user.email });
    }
}

export default new AuthController();
