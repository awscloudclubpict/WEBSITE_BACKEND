import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your_super_secret_jwt_key_change_this_in_production";

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
