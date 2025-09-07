// import { verifyToken } from "../utils/jwt.js";

// export function authMiddleware(req, res, next) {
//     const authHeader = req.headers.authorization;
//     if (!authHeader) return res.status(401).json({ error: "No token provided" });

//     const token = authHeader.split(" ")[1];
//     const user = verifyToken(token);
//     if (!user) return res.status(401).json({ error: "Invalid token" });

//     console.log(user);
//     req.user = user;
//     next();
// }
//this is the new code for authMiddleware.js /...
import { verifyToken } from "../utils/jwt.js";

export function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token provided" });

    const token = authHeader.split(" ")[1];
    const user = verifyToken(token);
    if (!user) return res.status(401).json({ error: "Invalid token" });

    req.user = user;
    next();
}
