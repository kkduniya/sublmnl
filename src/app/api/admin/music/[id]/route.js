import { NextResponse } from "next/server"
import { connectToDatabase } from "@/server/db"
import { ObjectId } from "mongodb"
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

// GET a specific music track
export async function GET(request, { params }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ success: false, message: "Track ID is required" }, { status: 400 })
    }

    const db = await connectToDatabase()
    const track = await db.collection("music").findOne({ _id: new ObjectId(id) })

    if (!track) {
      return NextResponse.json({ success: false, message: "Track not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      track: {
        ...track,
        _id: track._id.toString(),
      },
    })
  } catch (error) {
    console.error("Error fetching music track:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch music track",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

// PUT (update) a music track
export async function PUT(request, { params }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ success: false, message: "Track ID is required" }, { status: 400 })
    }

    const formData = await request.formData()
    const name = formData.get("name")
    const artist = formData.get("artist")
    const category = formData.get("category")
    const file = formData.get("file")

    if (!name || !category) {
      return NextResponse.json({ success: false, message: "Name and category are required" }, { status: 400 })
    }

    const db = await connectToDatabase()

    // Get the existing track
    const existingTrack = await db.collection("music").findOne({ _id: new ObjectId(id) })

    if (!existingTrack) {
      return NextResponse.json({ success: false, message: "Track not found" }, { status: 404 })
    }

    // Prepare update data
    const updateData = {
      name,
      artist: artist || "",
      category,
      updatedAt: new Date(),
    }

    // If a new file is uploaded, process it
    if (file && file.size > 0) {
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

      // Get audio duration
      const duration = await getAudioDuration(filePath)

      // Add file info to update data
      updateData.path = publicPath
      updateData.duration = duration

      // Optionally, delete the old file if it's in the uploads directory
      if (existingTrack.path && existingTrack.path.startsWith("/uploads/")) {
        const oldFilePath = path.join(process.cwd(), "public", existingTrack.path)
        if (fs.existsSync(oldFilePath)) {
          try {
            fs.unlinkSync(oldFilePath)
            console.log(`Deleted old file: ${oldFilePath}`)
          } catch (err) {
            console.error(`Error deleting old file: ${err.message}`)
          }
        }
      }
    }

    // Update the track in the database
    const result = await db.collection("music").updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: "Track not found" }, { status: 404 })
    }

    // Get the updated track
    const updatedTrack = await db.collection("music").findOne({ _id: new ObjectId(id) })

    return NextResponse.json({
      success: true,
      track: {
        ...updatedTrack,
        _id: updatedTrack._id.toString(),
      },
    })
  } catch (error) {
    console.error("Error updating music track:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update music track",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

// Update the DELETE function to completely remove the track from the database and delete the file

// DELETE a music track
export async function DELETE(request, { params }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ success: false, message: "Track ID is required" }, { status: 400 })
    }

    const db = await connectToDatabase()

    // Get the track to check if it exists and to get the file path
    const track = await db.collection("music").findOne({ _id: new ObjectId(id) })

    if (!track) {
      return NextResponse.json({ success: false, message: "Track not found" }, { status: 404 })
    }

    // Delete the file from the uploads folder if it exists
    if (track.path && track.path.startsWith("/uploads/")) {
      const filePath = path.join(process.cwd(), "public", track.path.replace(/^\//, ""))
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath)
          console.log(`Deleted file: ${filePath}`)
        } catch (err) {
          console.error(`Error deleting file: ${err.message}`)
          // Continue with database deletion even if file deletion fails
        }
      }
    }

    // Hard delete the track from the database
    const result = await db.collection("music").deleteOne({ _id: new ObjectId(id) })

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, message: "Failed to delete track" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Track deleted successfully from database and file system",
    })
  } catch (error) {
    console.error("Error deleting track:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete track",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

