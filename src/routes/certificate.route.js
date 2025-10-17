import express from "express";
import { createCertificate, getCertificateById } from "../controllers/certificate.controller.js";

const router = express.Router();

router.route("/")
  .post(createCertificate);

router.route("/:certificateId")
  .get(getCertificateById);

export default router;
