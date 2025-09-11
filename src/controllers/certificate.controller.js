import { Certificate } from "../models/certificate.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import fs from "fs";
import path from "path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { customAlphabet } from "nanoid";

// Create nanoid generator for certificate IDs
const nanoid = customAlphabet("ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789", 8);

const createCertificate = asyncHandler(async (req, res) => {
  const { name, event, role, organizer, date } = req.body;

  if (!name || !event || !role) {
    throw new ApiError(400, "Name, Event, and Role are required");
  }

  // Generate unique certificate ID
  const certificateId = `AWS-${nanoid()}`;

  // Ensure /public/temp exists
  const tempDir = path.join(process.cwd(), "public", "temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const fileName = `${name.replace(/\s+/g, "_")}_${Date.now()}.pdf`;
  const filePath = path.join(tempDir, fileName);

  // Load template
  const templatePath = path.join(process.cwd(), "public", "templates", "certificate-template.pdf");
  if (!fs.existsSync(templatePath)) {
    throw new ApiError(500, "Certificate template not found in /public/templates/");
  }
  const templateBytes = fs.readFileSync(templatePath);

  const pdfDoc = await PDFDocument.load(templateBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  // Fonts
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const normalFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Draw text
 firstPage.drawText(name, {
    x: 60,   // moved left
    y: 300,
    size: 28,
    font: boldFont,
    color: rgb(0.1, 0.1, 0.7),
  });

  firstPage.drawText(`${role} at ${event}`, {
    x: 60,   // aligned with name
    y: 270,
    size: 18,
    font: normalFont,
    color: rgb(0, 0, 0),
  });

  firstPage.drawText(`Date: ${date || new Date().toLocaleDateString()}`, {
    x: 60,
    y: 150,
    size: 14,
    font: normalFont,
  });

  firstPage.drawText(organizer || "AWS Cloud Club", {
    x: 400,
    y: 150,
    size: 14,
    font: normalFont,
  });

  // ✅ Add unique Certificate ID at bottom
  firstPage.drawText(`Certificate ID: ${certificateId}`, {
    x: 60,
    y: 80,
    size: 12,
    font: normalFont,
    color: rgb(0.5, 0.5, 0.5),
  });

  // Save PDF
  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(filePath, pdfBytes);

  // Save in DB
  const certificate = await Certificate.create({
    name,
    event,
    role,
    organizer,
    date,
    pdfPath: `/public/temp/${fileName}`,
    issuedBy: req.user?._id || null,
    certificateId, // ✅ store unique id
  });

  return res.status(201).json(
    new ApiResponse(201, certificate, "Certificate created with unique ID & PDF generated")
  );
});

export { createCertificate };
