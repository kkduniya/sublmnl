import { NextResponse } from "next/server"
import { connectToDatabase } from "@/server/db"
import fs from "fs"
import path from "path"

// Helper: ensure directory exists
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

// Helper: Get audio duration (placeholder)
async function getAudioDuration(filePath) {
  try {
    // TODO: integrate music-metadata for real duration
    return 180 // 3 minutes
  } catch (error) {
    console.error("Error getting audio duration:", error)
    return 0
  }
}

/**
 * GET - fetch all frequency audios
 */
export async function GET() {
  try {
    const db = await connectToDatabase()

    const audios = await db
      .collection("frequencyAudios")
      .find({ isActive: true })
      .sort({ createdAt: -1 })
      .toArray()

    const formatted = audios.map((a) => ({
      ...a,
      _id: a._id.toString(),
    }))

    return NextResponse.json({ success: true, audios: formatted })
  } catch (error) {
    console.error("Error fetching frequency audios:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch audios", error: error.message },
      { status: 500 }
    )
  }
}

/**
 * POST - upload frequency audio
 */
export async function POST(request) {
  try {
    const formData = await request.formData()

    // accept either "audioName" or "name"
    const audioName = formData.get("audioName") || formData.get("name")
    let area = formData.get("area") // Can be "None" or one of the 5
    const description = formData.get("description") || ""
    const file = formData.get("file")

    if (!audioName || !file) {
      return NextResponse.json(
        { success: false, message: "Audio name and file are required" },
        { status: 400 }
      )
    }

    // Handle None option
    if (!area || area.toLowerCase() === "none") {
      area = null
    } else {
      // Enforce only these 5 values
      const allowedAreas = ["Career", "Relationships", "Health", "Wealth", "Overall"]
      if (!allowedAreas.includes(area)) {
        return NextResponse.json(
          {
            success: false,
            message: `Invalid area. Allowed: ${allowedAreas.join(", ")}, or None`,
          },
          { status: 400 }
        )
      }

      // Check for duplicate area
      const db = await connectToDatabase()
      const existing = await db.collection("frequencyAudios").findOne({ area })
      if (existing) {
        return NextResponse.json(
          { success: false, message: `Area "${area}" is already assigned to another audio` },
          { status: 400 }
        )
      }
    }

    // Save file to /public/frequencies/
    const uploadsDir = path.join(process.cwd(), "public", "frequencies")
    if (!ensureDirectoryExists(uploadsDir)) {
      return NextResponse.json(
        { success: false, message: "Failed to create uploads directory" },
        { status: 500 }
      )
    }

    const timestamp = Date.now()
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
    const filename = `${timestamp}_${sanitizedFilename}`
    const filePath = path.join(uploadsDir, filename)

    // Convert and write file
    const buffer = Buffer.from(await file.arrayBuffer())
    fs.writeFileSync(filePath, buffer)
    console.log(`Frequency audio saved: ${filePath}`)

    const publicPath = `/frequencies/${filename}`

    // Get audio duration
    const duration = await getAudioDuration(filePath)

    // Insert into DB
    const db = await connectToDatabase()
    const newAudio = {
      audioName,
      area, // null if None
      description,
      path: publicPath,
      duration,
      isActive: true,
      createdAt: new Date(),
    }

    const result = await db.collection("frequencyAudios").insertOne(newAudio)

    return NextResponse.json({
      success: true,
      audio: { ...newAudio, _id: result.insertedId.toString() },
    })
  } catch (error) {
    console.error("Error uploading frequency audio:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload frequency audio",
        error: error.message,
      },
      { status: 500 }
    )
  }
}
