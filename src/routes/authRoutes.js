// import express from "express";
// import AuthController from "../controllers/authController.js";

// const router = express.Router();

// router.post("/register", (req, res) => AuthController.register(req, res));
// router.post("/login", (req, res) => AuthController.login(req, res));

// export default router;

//this is the new code for routing /...
import express from "express";
import AuthController from "../controllers/authController.js";

const router = express.Router();

router.post("/register/student", (req, res) => AuthController.registerStudent(req, res));
router.post("/register/professional", (req, res) => AuthController.registerProfessional(req, res));
router.post("/login", (req, res) => AuthController.login(req, res));

export default router;
