import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";
import { v4 as uuidv4 } from "uuid";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "ap-south-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "AKIA6IY35PHRIKEZBPQR",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "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",
  },
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
export const uploadToS3 = async (fileBuffer, fileName, mimeType, folder = "events") => {
  try {
    // Generate unique file name to avoid conflicts
    const fileExtension = fileName.split(".").pop();
    const uniqueFileName = `${folder}/${uuidv4()}.${fileExtension}`;

    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: uniqueFileName,
      Body: fileBuffer,
      ContentType: mimeType,
    };

    const parallelUploads3 = new Upload({
      client: s3Client,
      params: uploadParams,
    });

    await parallelUploads3.done();

    return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || "ap-south-1"}.amazonaws.com/${uniqueFileName}`;
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

    const deleteParams = {
      Bucket: BUCKET_NAME,
      Key: key,
    };

    const command = new DeleteObjectCommand(deleteParams);
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error("Error deleting from S3:", error);
    return false;
  }
};

export default s3Client;
