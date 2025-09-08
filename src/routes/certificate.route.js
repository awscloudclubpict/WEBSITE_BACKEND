import { Router } from "express";
import {
  createCertificate,

} from "../controllers/certificate.controller.js";

const router = Router();

// router.use(verifyJWT);

router.route("/")
  .post(createCertificate);   

// router.route("/:certificateId")
//   .get(getCertificateById)   
//   .patch(updateCertificate) 
//   .delete(deleteCertificate); 

export default router;
