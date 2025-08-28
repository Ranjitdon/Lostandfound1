import mongoose, { type Document, Schema } from "mongoose"

export interface IComment extends Document {
  itemId: mongoose.Types.ObjectId
  text: string
  createdAt: Date
  updatedAt: Date
}

const CommentSchema: Schema = new Schema(
  {
    itemId: {
      type: Schema.Types.ObjectId,
      ref: "Item",
      required: [true, "Item ID is required"],
    },
    text: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
      maxlength: [500, "Comment cannot be more than 500 characters"],
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema)
