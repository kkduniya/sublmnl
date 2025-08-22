import { NextResponse } from "next/server"
import { connectToDatabase } from "@/server/db"
import { ObjectId } from "mongodb"
import fs from "fs"
import path from "path"

// Ensure directory exists
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

// Dummy audio duration
async function getAudioDuration(filePath) {
  try {
    return 180 // 3 minutes
  } catch (error) {
    console.error("Error getting audio duration:", error)
    return 0
  }
}

// GET specific frequency audio
export async function GET(request, { params }) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json({ success: false, message: "Audio ID is required" }, { status: 400 })
    }

    const db = await connectToDatabase()
    const audio = await db.collection("frequencyAudios").findOne({ _id: new ObjectId(id) })

    if (!audio) {
      return NextResponse.json({ success: false, message: "Audio not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      audio: { ...audio, _id: audio._id.toString() },
    })
  } catch (error) {
    console.error("Error fetching frequency audio:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch frequency audio", error: error.message },
      { status: 500 }
    )
  }
}

// PUT (update frequency audio)
export async function PUT(request, { params }) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json({ success: false, message: "Audio ID is required" }, { status: 400 })
    }

    const formData = await request.formData()

    // accept either "audioName" or "name"
    const audioName = formData.get("audioName") || formData.get("name")
    let area = formData.get("area")
    const file = formData.get("file")

    if (!audioName) {
      return NextResponse.json({ success: false, message: "Audio name is required" }, { status: 400 })
    }

    // Handle area rules
    if (!area || area.toLowerCase() === "none") {
      area = null
    } else {
      const allowedAreas = ["Career", "Relationships", "Health", "Wealth", "Overall"]
      if (!allowedAreas.includes(area)) {
        return NextResponse.json(
          { success: false, message: `Invalid area. Allowed: ${allowedAreas.join(", ")}, or None` },
          { status: 400 }
        )
      }
    }

    const db = await connectToDatabase()
    const existingAudio = await db.collection("frequencyAudios").findOne({ _id: new ObjectId(id) })

    if (!existingAudio) {
      return NextResponse.json({ success: false, message: "Audio not found" }, { status: 404 })
    }

    // Prevent duplicate area (only if area is not null and not same as current)
    if (area && area !== existingAudio.area) {
      const duplicate = await db.collection("frequencyAudios").findOne({ area })
      if (duplicate) {
        return NextResponse.json(
          { success: false, message: `Area "${area}" is already assigned to another audio` },
          { status: 400 }
        )
      }
    }

    const updateData = {
      audioName,
      area,
      updatedAt: new Date(),
    }

    // If new file uploaded
    if (file && file.size > 0) {
      const uploadsDir = path.join(process.cwd(), "public", "frequencies")
      if (!ensureDirectoryExists(uploadsDir)) {
        return NextResponse.json(
          { success: false, message: "Failed to create uploads dir" },
          { status: 500 }
        )
      }

      const timestamp = Date.now()
      const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, "_")
      const filename = `${timestamp}_${sanitizedFilename}`
      const filePath = path.join(uploadsDir, filename)

      const buffer = Buffer.from(await file.arrayBuffer())
      fs.writeFileSync(filePath, buffer)

      const publicPath = `/frequencies/${filename}`
      const duration = await getAudioDuration(filePath)

      updateData.path = publicPath
      updateData.duration = duration

      // delete old file if exists
      if (existingAudio.path && existingAudio.path.startsWith("/frequencies/")) {
        const oldFilePath = path.join(process.cwd(), "public", existingAudio.path)
        if (fs.existsSync(oldFilePath)) {
          try {
            fs.unlinkSync(oldFilePath)
            console.log(`Deleted old frequency file: ${oldFilePath}`)
          } catch (err) {
            console.error(`Error deleting old file: ${err.message}`)
          }
        }
      }
    }

    await db.collection("frequencyAudios").updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    const updated = await db.collection("frequencyAudios").findOne({ _id: new ObjectId(id) })

    return NextResponse.json({ success: true, audio: { ...updated, _id: updated._id.toString() } })
  } catch (error) {
    console.error("Error updating frequency audio:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update frequency audio", error: error.message },
      { status: 500 }
    )
  }
}

// DELETE frequency audio
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    if (!id) {
      return NextResponse.json({ success: false, message: "Audio ID is required" }, { status: 400 })
    }

    const db = await connectToDatabase()
    const audio = await db.collection("frequencyAudios").findOne({ _id: new ObjectId(id) })

    if (!audio) {
      return NextResponse.json({ success: false, message: "Audio not found" }, { status: 404 })
    }

    // Delete file
    if (audio.path && audio.path.startsWith("/frequencies/")) {
      const filePath = path.join(process.cwd(), "public", audio.path.replace(/^\//, ""))
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath)
          console.log(`Deleted frequency file: ${filePath}`)
        } catch (err) {
          console.error(`Error deleting file: ${err.message}`)
        }
      }
    }

    await db.collection("frequencyAudios").deleteOne({ _id: new ObjectId(id) })

    return NextResponse.json({ success: true, message: "Frequency audio deleted successfully" })
  } catch (error) {
    console.error("Error deleting frequency audio:", error)
    return NextResponse.json(
      { success: false, message: "Failed to delete frequency audio", error: error.message },
      { status: 500 }
    )
  }
}
