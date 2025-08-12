import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ObjectId } from "mongodb"
import { updateAudio } from "@/server/models/audio"

export async function PATCH(request) {
  try {
    // Get the authenticated user session
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const { id, updates } = await request.json()

    if (!id) {
      return NextResponse.json({ success: false, message: "Audio id is required" }, { status: 400 })
    }
    if (!updates || typeof updates !== "object") {
      return NextResponse.json({ success: false, message: "Updates object is required" }, { status: 400 })
    }

    // Only allow updating audios belonging to the user (optional, for security)
    // You may want to add a check here to ensure the audio belongs to session.user.id

    const result = await updateAudio(new ObjectId(id), updates)

    if (result.modifiedCount === 0) {
      return NextResponse.json({ success: false, message: "No audio updated. Check the id." }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Audio updated successfully" })
  } catch (error) {
    console.error("Error updating audio:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update audio",
        error: error.message,
      },
      { status: 500 },
    )
  }
} 