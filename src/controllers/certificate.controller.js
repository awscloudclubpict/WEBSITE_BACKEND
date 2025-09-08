import { Certificate } from "../models/certificate.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import fs from "fs";
import path from "path";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";

const createCertificate = asyncHandler(async (req, res) => {
  const { name, event, role, organizer, date } = req.body;

  if (!name || !event || !role) {
    throw new ApiError(400, "Name, Event, and Role are required");
  }

  const tempDir = path.join(process.cwd(), "public", "temp");
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  const fileName = `${name.replace(/\s+/g, "_")}_${Date.now()}.pdf`;
  const filePath = path.join(tempDir, fileName);

  const templatePath = path.join(process.cwd(), "public", "templates", "certificate-template.pdf");
  if (!fs.existsSync(templatePath)) {
    throw new ApiError(500, "Certificate template not found in /public/templates/");
  }
  const templateBytes = fs.readFileSync(templatePath);

  const pdfDoc = await PDFDocument.load(templateBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  firstPage.drawText(name, {
    x: 280,
    y: 300,
    size: 28,
    font: helveticaBold,
    color: rgb(0, 0, 0.8),
  });

  firstPage.drawText(`${role} at ${event}`, {
    x: 200,
    y: 260,
    size: 18,
    font: helvetica,
    color: rgb(0, 0, 0),
  });

  firstPage.drawText(`Date: ${date || new Date().toLocaleDateString()}`, {
    x: 60,
    y: 150,
    size: 14,
    font: helvetica,
    color: rgb(0, 0, 0),
  });

  firstPage.drawText(organizer || "AWS Cloud Club", {
    x: 400,
    y: 150,
    size: 14,
    font: helvetica,
    color: rgb(0, 0, 0),
  });

  const pdfBytes = await pdfDoc.save();
  fs.writeFileSync(filePath, pdfBytes);

  const certificate = await Certificate.create({
    name,
    event,
    role,
    organizer,
    date,
    pdfPath: `/public/temp/${fileName}`,
    issuedBy: req.user?._id || null,
  });

  if (!certificate) {
    throw new ApiError(500, "Failed to create certificate");
  }

  return res.status(201).json(
    new ApiResponse(201, certificate, "Certificate created & PDF generated")
  );
});

export { createCertificate };
