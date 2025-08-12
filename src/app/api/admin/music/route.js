import { NextResponse } from "next/server"
import { connectToDatabase } from "@/server/db"
import fs from "fs"
import path from "path"

// Helper function to ensure directories exist
function ensureDirectoryExists(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
      console.log(`Created directory: ${dirPath}`)
    }
    return true
  } catch (error) {
    console.error(`Error creating directory ${dirPath}:`, error)
    return false
  }
}

// Helper function to get audio duration
async function getAudioDuration(filePath) {
  try {
    // In a real implementation, you would use a library like music-metadata
    // For now, we'll return a placeholder duration
    return 180 // 3 minutes in seconds
  } catch (error) {
    console.error("Error getting audio duration:", error)
    return 0
  }
}

export async function GET(request) {
  try {
    // Connect to the database
    const db = await connectToDatabase()

    // Fetch all music tracks from the database
    const tracks = await db.collection("music").find({ isActive: true }).sort({ name: 1 }).toArray()

    // Transform the data to ensure _id is a string
    const formattedTracks = tracks.map((track) => ({
      ...track,
      _id: track._id.toString(),
    }))

    return NextResponse.json({
      success: true,
      tracks: formattedTracks,
    })
  } catch (error) {
    console.error("Error fetching music tracks:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch music tracks",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

export async function POST(request) {
  try {
    const formData = await request.formData()

    const name = formData.get("name")
    const artist = formData.get("artist")
    const category = formData.get("category")
    const file = formData.get("file")

    if (!name || !category || !file) {
      return NextResponse.json({ success: false, message: "Name, category, and file are required" }, { status: 400 })
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), "public", "uploads")
    if (!ensureDirectoryExists(uploadsDir)) {
      return NextResponse.json({ success: false, message: "Failed to create uploads directory" }, { status: 500 })
    }

    // Generate a unique filename
    const timestamp = Date.now()
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const filename = `${timestamp}_${sanitizedFilename}`
    const filePath = path.join(uploadsDir, filename)

    // Get the file buffer
    const buffer = Buffer.from(await file.arrayBuffer())

    // Write the file to disk
    fs.writeFileSync(filePath, buffer)
    console.log(`File saved to ${filePath}`)

    // Get the public path for the file
    const publicPath = `/uploads/${filename}`

    // Get audio duration (in a real app, you would extract this from the file)
    const duration = await getAudioDuration(filePath)

    // Connect to the database
    const db = await connectToDatabase()

    // Create the track record
    const newTrack = {
      name,
      artist: artist || "",
      category,
      path: publicPath,
      duration,
      isActive: true,
      createdAt: new Date(),
    }

    // Save to database
    const result = await db.collection("music").insertOne(newTrack)

    return NextResponse.json({
      success: true,
      track: {
        ...newTrack,
        _id: result.insertedId.toString(),
      },
    })
  } catch (error) {
    console.error("Error creating music track:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create music track",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

