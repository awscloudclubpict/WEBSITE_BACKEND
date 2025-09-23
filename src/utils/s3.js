import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

// Configure AWS S3 Client
const s3Client = new S3Client({
  credentials: {
    accessKeyId: "AKIA6IY35PHRIKEZBPQR",
    secretAccessKey: "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",
  },
  region: process.env.AWS_REGION || "ap-south-1",
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || "awsccpicteventcerts";

/**
 * Upload file to S3 and return the URL
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} fileName - Original file name
 * @param {string} mimeType - File MIME type
 * @param {string} folder - Folder name (default: 'events')
 * @returns {Promise<string>} - S3 URL of uploaded file
 */
export const uploadToS3 = async (
  fileBuffer,
  fileName,
  mimeType,
  folder = "events"
) => {
  try {
    // Generate unique file name to avoid conflicts
    const fileExtension = fileName.split(".").pop();
    const uniqueFileName = `${folder}/${uuidv4()}.${fileExtension}`;

    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: uniqueFileName,
      Body: fileBuffer,
      ContentType: mimeType,
      // Removed ACL as many S3 buckets don't support it anymore
    });

    const result = await s3Client.send(command);

    // Construct the URL manually since v3 doesn't return Location
    const region = process.env.AWS_REGION || "ap-south-1";
    const url = `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${uniqueFileName}`;

    return url;
  } catch (error) {
    console.error("Error uploading to S3:", error);
    throw new Error("Failed to upload image to S3");
  }
};

/**
 * Delete file from S3
 * @param {string} imageUrl - The S3 URL of the file to delete
 * @returns {Promise<boolean>} - Success status
 */
export const deleteFromS3 = async (imageUrl) => {
  try {
    // Extract key from URL
    const urlParts = imageUrl.split("/");
    const key = urlParts.slice(3).join("/"); // Remove https://bucket-name.s3.region.amazonaws.com/

    const command = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error("Error deleting from S3:", error);
    return false;
  }
};

export default s3Client;
