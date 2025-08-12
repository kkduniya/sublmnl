import { NextResponse } from "next/server"
import { connectToDatabase } from "@/server/db"
import { ObjectId } from "mongodb"

// GET a specific theme
export async function GET(request, { params }) {
  try {
    const { id } = params
    const db = await connectToDatabase()

    // Find the theme by ID
    const theme = await db.collection("themes").findOne({ _id: new ObjectId(id) })

    if (!theme) {
      return NextResponse.json({ success: false, message: "Theme not found" }, { status: 404 })
    }

    // Format the theme for response
    const formattedTheme = {
      ...theme,
      _id: theme._id.toString(),
    }

    return NextResponse.json({ success: true, theme: formattedTheme })
  } catch (error) {
    console.error("Error fetching theme:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch theme", error: error.message },
      { status: 500 },
    )
  }
}

// PUT (update) a theme
export async function PUT(request, { params }) {
  try {
    const { id } = params
    const data = await request.json()
    const db = await connectToDatabase()

    console.log("Updating theme:", id, data)

    // If this is set as the default theme, unset any existing default themes
    if (data.isDefault) {
      await db.collection("themes").updateMany({ _id: { $ne: new ObjectId(id) } }, { $set: { isDefault: false } })
    }

    // Prepare the update data
    const updateData = {
      ...data,
      updatedAt: new Date(),
    }

    // Remove _id from the update data to avoid MongoDB error
    delete updateData._id

    // Update the theme
    const result = await db.collection("themes").updateOne({ _id: new ObjectId(id) }, { $set: updateData })

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: "Theme not found" }, { status: 404 })
    }

    // Get the updated theme
    const updatedTheme = await db.collection("themes").findOne({ _id: new ObjectId(id) })

    // Format the updated theme for response
    const formattedTheme = {
      ...updatedTheme,
      _id: updatedTheme._id.toString(),
    }

    return NextResponse.json({ success: true, theme: formattedTheme })
  } catch (error) {
    console.error("Error updating theme:", error)
    return NextResponse.json(
      { success: false, message: "Failed to update theme", error: error.message },
      { status: 500 },
    )
  }
}

// DELETE a theme
export async function DELETE(request, { params }) {
  try {
    const { id } = params
    const db = await connectToDatabase()

    // Check if this is the default theme
    const theme = await db.collection("themes").findOne({ _id: new ObjectId(id) })

    if (!theme) {
      return NextResponse.json({ success: false, message: "Theme not found" }, { status: 404 })
    }

    // Don't allow deleting the default theme if it's the only theme
    if (theme.isDefault) {
      const count = await db.collection("themes").countDocuments()
      if (count <= 1) {
        return NextResponse.json({ success: false, message: "Cannot delete the only theme" }, { status: 400 })
      }
    }

    // Delete the theme
    await db.collection("themes").deleteOne({ _id: new ObjectId(id) })

    // If we deleted the default theme, set another theme as default
    if (theme.isDefault) {
      const anotherTheme = await db.collection("themes").findOne({ _id: { $ne: new ObjectId(id) } })
      if (anotherTheme) {
        await db.collection("themes").updateOne({ _id: anotherTheme._id }, { $set: { isDefault: true } })
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting theme:", error)
    return NextResponse.json(
      { success: false, message: "Failed to delete theme", error: error.message },
      { status: 500 },
    )
  }
}

