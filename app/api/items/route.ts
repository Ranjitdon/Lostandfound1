import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Item from "@/models/Item"
import { uploadImageToS3 } from "@/lib/s3"

// GET /api/items - Fetch all items
export async function GET() {
  try {
    console.log("[v0] Attempting to connect to database...")
    await connectDB()
    console.log("[v0] Database connected successfully")

    const items = await Item.find({}).sort({ createdAt: -1 }).lean()
    console.log("[v0] Found", items.length, "items")

    return NextResponse.json({
      success: true,
      data: items,
    })
  } catch (error) {
    console.error("[v0] Error in GET /api/items:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch items",
        details: "Database connection or query failed",
      },
      { status: 500 },
    )
  }
}

// POST /api/items - Upload a new item
export async function POST(request: NextRequest) {
  try {
    console.log("[v0] POST request received")
    await connectDB()
    console.log("[v0] Database connected for POST")

    const formData = await request.formData()
    const title = formData.get("title") as string
    const description = formData.get("description") as string
    const contactInfo = formData.get("contactInfo") as string
    const image = formData.get("image") as File

    // Validate required fields
    if (!title || !description || !contactInfo || !image) {
      return NextResponse.json(
        {
          success: false,
          error: "All fields are required",
        },
        { status: 400 },
      )
    }

    // Upload image to S3
    const uploadResult = await uploadImageToS3(image, image.name)

    if (!uploadResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: uploadResult.error || "Failed to upload image",
        },
        { status: 400 },
      )
    }

    // Create new item in database
    const newItem = new Item({
      title: title.trim(),
      description: description.trim(),
      contactInfo: contactInfo.trim(),
      imageUrl: uploadResult.url,
    })

    const savedItem = await newItem.save()

    return NextResponse.json(
      {
        success: true,
        data: savedItem,
        message: "Item uploaded successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] Error in POST /api/items:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create item",
        details: "Database connection, upload, or save operation failed",
      },
      { status: 500 },
    )
  }
}
