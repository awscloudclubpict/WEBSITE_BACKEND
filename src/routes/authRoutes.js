
import express from "express";
import AuthController from "../controllers/authController.js";

const router = express.Router();

router.post("/register/student", (req, res) => AuthController.registerStudent(req, res));
router.post("/register/professional", (req, res) => AuthController.registerProfessional(req, res));
router.post("/register/admin", (req, res) => AuthController.registerAdmin(req, res));
router.post("/login", (req, res) => AuthController.login(req, res));
router.post("/logout", (req, res) => {
    res.clearCookie('token');
    res.json({ message: "Logged out" });
});

export default router;
