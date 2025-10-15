// routes/emailRoutes.js
import express from "express";
import { sendMail } from "../controllers/emailController.js";

const router = express.Router();

router.post("/sendEmail", sendMail);

export default router;
