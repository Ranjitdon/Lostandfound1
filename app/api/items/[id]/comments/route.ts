import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Item from "@/models/Item"
import Comment from "@/models/Comment"
import mongoose from "mongoose"

// POST /api/items/[id]/comments - Add comment to an item
export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const { id } = params
    const body = await request.json()
    const { text } = body

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid item ID",
        },
        { status: 400 },
      )
    }

    // Validate comment text
    if (!text || typeof text !== "string" || text.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Comment text is required",
        },
        { status: 400 },
      )
    }

    // Check if item exists
    const item = await Item.findById(id)
    if (!item) {
      return NextResponse.json(
        {
          success: false,
          error: "Item not found",
        },
        { status: 404 },
      )
    }

    // Create new comment
    const newComment = new Comment({
      itemId: id,
      text: text.trim(),
    })

    const savedComment = await newComment.save()

    return NextResponse.json(
      {
        success: true,
        data: savedComment,
        message: "Comment added successfully",
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add comment",
      },
      { status: 500 },
    )
  }
}
