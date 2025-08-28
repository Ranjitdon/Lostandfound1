import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const BUCKET_NAME = process.env.AWS_S3_BUCKET!

export interface UploadResult {
  success: boolean
  url?: string
  error?: string
}

export async function uploadImageToS3(file: File, fileName: string): Promise<UploadResult> {
  try {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      return {
        success: false,
        error: "File must be an image",
      }
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: "File size must be less than 5MB",
      }
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Generate unique filename with timestamp
    const timestamp = Date.now()
    const uniqueFileName = `${timestamp}-${fileName}`

    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: `lost-found-items/${uniqueFileName}`,
      Body: buffer,
      ContentType: file.type,
      ACL: "public-read" as const,
    }

    const command = new PutObjectCommand(uploadParams)
    await s3Client.send(command)

    // Construct the public URL
    const imageUrl = `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/lost-found-items/${uniqueFileName}`

    return {
      success: true,
      url: imageUrl,
    }
  } catch (error) {
    console.error("Error uploading to S3:", error)
    return {
      success: false,
      error: "Failed to upload image",
    }
  }
}

export async function deleteImageFromS3(imageUrl: string): Promise<boolean> {
  try {
    // Extract the key from the URL
    const urlParts = imageUrl.split("/")
    const key = urlParts.slice(-2).join("/") // Get "lost-found-items/filename"

    const deleteParams = {
      Bucket: BUCKET_NAME,
      Key: key,
    }

    const command = new DeleteObjectCommand(deleteParams)
    await s3Client.send(command)

    return true
  } catch (error) {
    console.error("Error deleting from S3:", error)
    return false
  }
}

export async function generatePresignedUrl(fileName: string, fileType: string, expiresIn = 3600): Promise<string> {
  const timestamp = Date.now()
  const uniqueFileName = `${timestamp}-${fileName}`

  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: `lost-found-items/${uniqueFileName}`,
    ContentType: fileType,
    ACL: "public-read",
  })

  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn })
  return signedUrl
}
