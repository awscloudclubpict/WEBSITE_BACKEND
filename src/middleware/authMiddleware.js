
import { verifyToken } from "../utils/jwt.js";

export function authMiddleware(req, res, next) {
    let token;

    const authHeader = req.headers.authorization;
    if (authHeader) {
        token = authHeader.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) return res.status(401).json({ error: "No token provided" });

    const user = verifyToken(token);
    if (!user) return res.status(401).json({ error: "Invalid token" });

    req.user = user;
    next();
}
