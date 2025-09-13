

import jwt from "jsonwebtoken";

const JWT_SECRET = "your_jwt_secret_here";  // Ideally store in environment variables

export function generateToken(payload) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

export function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}
