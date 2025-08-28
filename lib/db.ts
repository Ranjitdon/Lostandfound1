import mongoose from "mongoose"

const MONGODB_URI = process.env.MONGO_URI

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGO_URI environment variable. Add it to your Vercel project settings or .env.local file.",
  )
}

// Global is used here to maintain a cached connection across hot reloads in development
let cached = (global as any).mongoose

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null }
}

async function connectDB() {
  if (cached.conn) {
    console.log("[v0] Using cached database connection")
    return cached.conn
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    }

    console.log("[v0] Creating new database connection...")
    cached.promise = mongoose.connect(MONGODB_URI!, opts).then((mongoose) => {
      console.log("[v0] Database connection established")
      return mongoose
    })
  }

  try {
    cached.conn = await cached.promise
  } catch (e) {
    console.error("[v0] Database connection failed:", e)
    cached.promise = null
    throw e
  }

  return cached.conn
}

export default connectDB
