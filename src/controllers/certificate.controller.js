const Certificate = require("../models/certificate.model.js");
const fs = require("fs");
const path = require("path");
const { PDFDocument, rgb, StandardFonts } = require("pdf-lib");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

let nanoid;
(async () => {
  const { customAlphabet } = await import("nanoid");
  nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 8);
})();

const s3 = new S3Client({ region: process.env.AWS_REGION });

const createCertificate = async (req, res) => {
  try {
    const { name, event, role, organizer, date } = req.body;

    if (!name || !event || !role) {
      return res.status(400).json({ error: "Name, Event, and Role are required" });
    }

    while (!nanoid) {
      await new Promise((r) => setTimeout(r, 10));
    }

    const certificateId = `AWS-${nanoid()}`;

    const tempDir = path.join(process.cwd(), "public", "temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    const fileName = `${name.replace(/\s+/g, "_")}_${Date.now()}.pdf`;
    const filePath = path.join(tempDir, fileName);

   
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

  
    firstPage.drawText(name, { x: 70, y: 300, size: 35, font: boldFont, color: rgb(0, 0, 0) });


    const achievementText = `For an outstanding achievement as ${role} at ${event}`;
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

    const lines = wrapText(achievementText, normalFont, 18, 450);
    let yPosition = 250;
    lines.forEach((line) => {
      firstPage.drawText(line, { x: 70, y: yPosition, size: 18, font: normalFont, color: rgb(0, 0, 0) });
      yPosition -= 25;
    });

 
    firstPage.drawText(`Date: ${date || new Date().toLocaleDateString()}`, {
      x: 60, y: 100, size: 12, font: normalFont, color: rgb(0.2, 0.2, 0.2),
    });

    if (organizer) {
      firstPage.drawText(organizer, { x: 300, y: 100, size: 12, font: normalFont, color: rgb(0.2, 0.2, 0.2) });
    }

    firstPage.drawText(`Certificate ID: ${certificateId}`, { x: 60, y: 70, size: 10, font: normalFont, color: rgb(0.4, 0.4, 0.4) });


    const pdfBytes = await pdfDoc.save();
    fs.writeFileSync(filePath, pdfBytes);

 
    const fileContent = fs.readFileSync(filePath);
    const s3Params = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `certificates/${fileName}`, // folder path in S3
      Body: fileContent,
      ContentType: "application/pdf",
    };
    await s3.send(new PutObjectCommand(s3Params));

    const s3Url = `https://${process.env.AWS_S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/certificates/${fileName}`;

    
    fs.unlinkSync(filePath);

   
    const certificate = await Certificate.create({
      name,
      event,
      role,
      organizer,
      date,
      pdfPath: s3Url,
      issuedBy: req.user?._id || null,
      certificateId,
    });

    res.status(201).json({
      message: "Certificate created, uploaded to S3 & saved in DB",
      certificate,
    });
  } catch (error) {
    console.error("Error creating certificate:", error);
    res.status(500).json({ error: "Failed to create certificate", details: error.message });
  }
};

const getAllCertificates = async (req, res) => {
  try {
    const certificates = await Certificate.find().sort({ date: -1 });
    res.status(200).json(certificates);
  } catch (error) {
    console.error("Error fetching certificates:", error.message);
    res.status(500).json({ error: "Failed to fetch certificates", details: error.message });
  }
};

const getCertificateById = async (req, res) => {
  try {
    const { id } = req.params;
    const certificate = await Certificate.findOne({ certificateId: id });
    if (!certificate) return res.status(404).json({ error: "Certificate not found" });
    res.status(200).json(certificate);
  } catch (error) {
    console.error("Error fetching certificate:", error.message);
    res.status(500).json({ error: "Failed to fetch certificate", details: error.message });
  }
};

const deleteCertificate = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedCertificate = await Certificate.findOneAndDelete({ certificateId: id });
    if (!deletedCertificate) return res.status(404).json({ error: "Certificate not found" });
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
