import mongoose, { type Document, Schema } from "mongoose"

export interface IItem extends Document {
  title: string
  description: string
  contactInfo: string
  imageUrl: string
  createdAt: Date
  updatedAt: Date
}

const ItemSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [100, "Title cannot be more than 100 characters"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
      maxlength: [1000, "Description cannot be more than 1000 characters"],
    },
    contactInfo: {
      type: String,
      required: [true, "Contact information is required"],
      trim: true,
      maxlength: [200, "Contact info cannot be more than 200 characters"],
    },
    imageUrl: {
      type: String,
      required: [true, "Image URL is required"],
    },
  },
  {
    timestamps: true,
  },
)

export default mongoose.models.Item || mongoose.model<IItem>("Item", ItemSchema)
