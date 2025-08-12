import { NextResponse } from "next/server"
import { connectToDatabase } from "@/server/db"
import { ObjectId } from "mongodb"

export async function POST(request, { params }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ success: false, message: "Audio ID is required" }, { status: 400 })
    }

    // In a real app, you would get the user ID from the session
    // For now, we'll use a placeholder user ID
    const userId = "user123" // Replace with actual user ID from session

    const db = await connectToDatabase()

    // Add the audio to the user's favorites
    const result = await db
      .collection("users")
      .updateOne({ _id: new ObjectId(userId) }, { $addToSet: { favoriteAudios: new ObjectId(id) } })

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Audio added to favorites",
    })
  } catch (error) {
    console.error("Error adding to favorites:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to add to favorites",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ success: false, message: "Audio ID is required" }, { status: 400 })
    }

    // In a real app, you would get the user ID from the session
    // For now, we'll use a placeholder user ID
    const userId = "user123" // Replace with actual user ID from session

    const db = await connectToDatabase()

    // Remove the audio from the user's favorites
    const result = await db
      .collection("users")
      .updateOne({ _id: new ObjectId(userId) }, { $pull: { favoriteAudios: new ObjectId(id) } })

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "Audio removed from favorites",
    })
  } catch (error) {
    console.error("Error removing from favorites:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to remove from favorites",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

