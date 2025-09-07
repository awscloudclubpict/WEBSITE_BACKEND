// import jwt from 'jsonwebtoken';

// const SECRET_KEY = process.env.JWT_SECRET || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpYXQiOjE3NTcxNTcwODcsImV4cCI6MTc1NzE2MDY4N30.RTwKa_rOjWjMzuloT4htGEPpBcTF7e_UQ1dgz9N5wXo';

// export const generateToken = (user) => {
//     const payload = { id: user.id, username: user.username,email: user.email };
//     return jwt.sign(payload, SECRET_KEY, { expiresIn: '1h' });
// };

// export const verifyToken = (token) => {
//     try {
//         return jwt.verify(token, SECRET_KEY);
//     } catch (error) {
//         return null;
//     }
// };


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
