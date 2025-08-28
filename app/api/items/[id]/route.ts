import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db"
import Item from "@/models/Item"
import Comment from "@/models/Comment"
import mongoose from "mongoose"

// GET /api/items/[id] - Fetch single item with comments
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB()

    const { id } = params

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

    // Find item
    const item = await Item.findById(id).lean()

    if (!item) {
      return NextResponse.json(
        {
          success: false,
          error: "Item not found",
        },
        { status: 404 },
      )
    }

    // Find comments for this item
    const comments = await Comment.find({ itemId: id }).sort({ createdAt: -1 }).lean()

    return NextResponse.json({
      success: true,
      data: {
        item,
        comments,
      },
    })
  } catch (error) {
    console.error("Error fetching item:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch item",
      },
      { status: 500 },
    )
  }
}
