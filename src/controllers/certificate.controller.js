
require('dotenv').config();

const Certificate = require("../models/certificate.model.js");
const fs = require("fs");
const path = require("path");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const crypto = require("crypto");
const mongoose = require("mongoose");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

let nanoid;
(async () => {
  const { customAlphabet } = await import("nanoid");
  nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 8);
})();

// Validate required AWS envs early (optional but helpful)
if (!process.env.AWS_S3_BUCKET_NAME) {
  console.warn("Warning: AWS_S3_BUCKET_NAME is not set in .env — S3 uploads will fail.");
}
if (!process.env.AWS_REGION) {
  console.warn("Warning: AWS_REGION not set in .env — set it to your S3 region.");
}

// Initialize S3 client (SDK will pick credentials from env or IAM role)
const s3 = new S3Client({ region: process.env.AWS_REGION });

// CREATE CERTIFICATE (with S3 upload)
const createCertificate = async (req, res) => {
  try {
    const { name, event, date } = req.body;

    if (!name || !event) {
      return res.status(400).json({ error: "Name and Event are required" });
    }

    // wait until nanoid is ready
    while (!nanoid) await new Promise((r) => setTimeout(r, 10));

    // Temporary folder to generate PDF
    const tempDir = path.join(process.cwd(), "public", "temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const fileName = `${name.replace(/\s+/g, "_")}_${Date.now()}.pdf`;
    const filePath = path.join(tempDir, fileName);

    // Load PDF template
    const templatePath = path.join(process.cwd(), "public", "templates", "certificate-template.pdf");
    if (!fs.existsSync(templatePath)) {
      return res.status(500).json({ error: "Certificate template not found in /public/templates/" });
    }

    const templateBytes = fs.readFileSync(templatePath);
    const pdfDoc = await PDFDocument.load(templateBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const normalFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

    // Draw recipient name (bold)
    firstPage.drawText(name, { x: 70, y: 280, size: 35, font: boldFont, color: rgb(0, 0, 0) });

    // Prepare achievement text
    const achievementText = `For an outstanding achievement at ${event} with `;

    function wrapText(text, font, size, maxWidth) {
      const words = text.split(" ");
      let line = "";
      const lines = [];

      words.forEach((word) => {
        const testLine = line ? line + " " + word : word;
        const width = font.widthOfTextAtSize(testLine, size);
        if (width > maxWidth) {
          lines.push(line);
          line = word;
        } else {
          line = testLine;
        }
      });

      if (line) lines.push(line);
      return lines;
    }

    // Draw wrapped achievement text (single-font)
    let yPosition = 220;
    const wrappedLines = wrapText(achievementText, normalFont, 18, 450);
    wrappedLines.forEach((line) => {
      firstPage.drawText(line, { x: 70, y: yPosition, size: 18, font: normalFont, color: rgb(0, 0, 0) });
      yPosition -= 25;
    });

    // Add date
    firstPage.drawText(`Date: ${date || new Date().toLocaleDateString()}`, {
      x: 70,
      y: 100,
      size: 12,
      font: normalFont,
      color: rgb(0.2, 0.2, 0.2),
    });

    // Pre-generate Mongo ObjectId and encrypted certificateId (so Mongoose required field passes)
    const tempId = new mongoose.Types.ObjectId();
    const secretKey = process.env.CERT_SECRET || "mysecretkey";
    const hash = crypto
      .createHmac("sha256", secretKey)
      .update(tempId.toString())
      .digest("hex")
      .slice(0, 12)
      .toUpperCase();
    const certificateId = `AWS-${hash}`;

    // Draw certificate ID on PDF
    firstPage.drawText(`Certificate ID: ${certificateId}`, {
      x: 70,
      y: 70,
      size: 10,
      font: normalFont,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Save PDF locally
    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(filePath, pdfBytes);

    // Ensure bucket env set
    if (!process.env.AWS_S3_BUCKET_NAME) {
      // leave file for debugging
      return res.status(500).json({ error: "AWS_S3_BUCKET_NAME is not defined in .env" });
    }

    // Upload to S3 under certificates/<certificateId>/<fileName>
    const fileContent = fs.readFileSync(filePath);
    const s3Key = `certificates/${certificateId}/${fileName}`;

    const s3Params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: s3Key,
      Body: fileContent,
      ContentType: "application/pdf",
    };

    try {
      await s3.send(new PutObjectCommand(s3Params));
    } catch (uploadErr) {
      console.error("S3 upload failed:", uploadErr);
      // keep local file for debugging; respond with error
      return res.status(500).json({ error: "Failed to upload PDF to S3", details: uploadErr.message });
    }

    // Construct S3 URL (virtual-host style)
    const s3Url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;

    // Delete local temp file after successful upload
    try {
      fs.unlinkSync(filePath);
    } catch (unlinkErr) {
      console.warn("Could not delete temp file:", unlinkErr);
    }

    // Create DB entry with S3 path and pre-generated _id + certificateId
    const certificate = await Certificate.create({
      _id: tempId,
      name,
      event,
      date,
      pdfPath: s3Url,
      issuedBy: req.user?._id || null,
      certificateId,
    });

    return res.status(201).json({
      message: "Certificate created, uploaded to S3 & saved in DB",
      certificate,
    });
  } catch (error) {
    console.error("Error creating certificate:", error);
    return res.status(500).json({ error: "Failed to create certificate", details: error.message });
  }
};

// GET ALL CERTIFICATES
const getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find().sort({ date: -1 });
    res.status(200).json(certificates);
  } catch (error) {
    console.error("Error fetching certificates:", error.message);
    res.status(500).json({ error: "Failed to fetch certificates", details: error.message });
  }
};

// GET CERTIFICATE BY ID (search by certificateId)
const getCertificateById = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const certificate = await Certificate.findOne({ certificateId });
    if (!certificate) return res.status(404).json({ error: "Certificate not found" });
    res.status(200).json(certificate);
  } catch (error) {
    console.error("Error fetching certificate:", error.message);
    res.status(500).json({ error: "Failed to fetch certificate", details: error.message });
  }
};

// DELETE CERTIFICATE (by certificateId)
const deleteCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCertificate = await Certificate.findOneAndDelete({ certificateId: id });
    if (!deletedCertificate) return res.status(404).json({ error: "Certificate not found" });
    // Note: this does not delete the object from S3. If you'd like that, we can add S3 DeleteObject.
    res.status(200).json({ message: "Certificate deleted successfully", certificate: deletedCertificate });
  } catch (error) {
    console.error("Error deleting certificate:", error.message);
    res.status(500).json({ error: "Failed to delete certificate", details: error.message });
  }
};

module.exports = {
  createCertificate,
  getAllCertificates,
  getCertificateById,
  deleteCertificate,
};
