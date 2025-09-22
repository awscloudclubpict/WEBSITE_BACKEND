const express = require("express");
const { createCertificate , getCertificateById} = require("../controllers/certificate.controller.js");

const router = express.Router();

// router.use(verifyJWT);

router.route("/")
  .post(createCertificate);

router.route("/:certificateId")
  .get(getCertificateById)
//   .patch(updateCertificate)
//   .delete(deleteCertificate);

module.exports = router;
