import { NextResponse } from "next/server"
import { connectToDatabase } from "@/server/db"
import { ObjectId } from "mongodb"

// PUT to set a theme as default
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const db = await connectToDatabase()

    // First, unset any existing default themes
    await db.collection("themes").updateMany({}, { $set: { isDefault: false } })

    // Then set the specified theme as default
    const result = await db.collection("themes").findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          isDefault: true,
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" },
    )

    if (!result) {
      return NextResponse.json({ success: false, message: "Theme not found" }, { status: 404 })
    }

    // Format the updated theme for response
    const formattedTheme = {
      ...result,
      _id: result._id.toString(),
    }

    return NextResponse.json({ success: true, theme: formattedTheme })
  } catch (error) {
    console.error("Error setting default theme:", error)
    return NextResponse.json(
      { success: false, message: "Failed to set default theme", error: error.message },
      { status: 500 },
    )
  }
}

