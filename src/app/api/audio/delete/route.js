import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { ObjectId } from "mongodb"
import { deleteAudio } from "@/server/models/audio"

export async function DELETE(request) {
  try {
    // Get the authenticated user session
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 })
    }

    // Parse request body
    const { id } = await request.json()

    if (!id) {
      return NextResponse.json({ success: false, message: "Audio id is required" }, { status: 400 })
    }

    // Only allow deleting audios belonging to the user (optional, for security)
    // You may want to add a check here to ensure the audio belongs to session.user.id

    const result = await deleteAudio(new ObjectId(id))

    if (result.deletedCount === 0) {
      return NextResponse.json({ success: false, message: "No audio deleted. Check the id." }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Audio deleted successfully" })
  } catch (error) {
    console.error("Error deleting audio:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete audio",
        error: error.message,
      },
      { status: 500 },
    )
  }
} 