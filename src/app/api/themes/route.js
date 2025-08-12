import { NextResponse } from "next/server"
import { connectToDatabase } from "@/server/db"
import { ObjectId } from "mongodb"

// GET all themes
export async function GET() {
  try {
    const db = await connectToDatabase()

    // Get all themes from the database
    const themes = await db.collection("themes").find({}).toArray()

    // If no themes exist, create default themes
    if (themes.length === 0) {
      const defaultThemes = [
        {
          name: "Default Blue",
          isDefault: true,
          palettes: [
            {
              name: "Blue Primary",
              isActive: true,
              colors: [
                "#4169E1", // Royal Blue
                "#87CEEB", // Sky Blue
                "#1E90FF", // Dodger Blue
                "#6495ED", // Cornflower Blue
              ],
            },
          ],
          variables: {
            primary: "220 70% 50%",
            secondary: "210 60% 45%",
            accent: "200 80% 55%",
            background: "220 20% 10%",
            foreground: "0 0% 98%",
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Purple Dream",
          isDefault: false,
          palettes: [
            {
              name: "Purple Haze",
              isActive: true,
              colors: [
                "#8A2BE2", // Blue Violet
                "#9370DB", // Medium Purple
                "#BA55D3", // Medium Orchid
                "#9932CC", // Dark Orchid
              ],
            },
          ],
          variables: {
            primary: "270 70% 50%",
            secondary: "280 60% 45%",
            accent: "290 80% 55%",
            background: "270 20% 10%",
            foreground: "0 0% 98%",
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: "Green Nature",
          isDefault: false,
          palettes: [
            {
              name: "Forest",
              isActive: true,
              colors: [
                "#2E8B57", // Sea Green
                "#3CB371", // Medium Sea Green
                "#20B2AA", // Light Sea Green
                "#32CD32", // Lime Green
              ],
            },
          ],
          variables: {
            primary: "150 70% 40%",
            secondary: "160 60% 45%",
            accent: "140 80% 55%",
            background: "150 20% 10%",
            foreground: "0 0% 98%",
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      // Insert default themes
      await db.collection("themes").insertMany(defaultThemes)

      // Return the newly created default themes
      return NextResponse.json({
        success: true,
        themes: defaultThemes.map((theme) => ({
          ...theme,
          _id: theme._id ? theme._id.toString() : new ObjectId().toString(),
        })),
      })
    }

    // Format the themes for response
    const formattedThemes = themes.map((theme) => ({
      ...theme,
      _id: theme._id.toString(),
    }))

    return NextResponse.json({ success: true, themes: formattedThemes })
  } catch (error) {
    console.error("Error fetching themes:", error)
    return NextResponse.json(
      { success: false, message: "Failed to fetch themes", error: error.message },
      { status: 500 },
    )
  }
}

// POST a new theme
export async function POST(request) {
  try {
    const data = await request.json()
    const db = await connectToDatabase()

    // If this is set as the default theme, unset any existing default themes
    if (data.isDefault) {
      await db.collection("themes").updateMany({}, { $set: { isDefault: false } })
    }

    // Prepare the theme data
    const themeData = {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Insert the new theme
    const result = await db.collection("themes").insertOne(themeData)

    // Return the newly created theme
    return NextResponse.json(
      {
        success: true,
        theme: {
          ...themeData,
          _id: result.insertedId.toString(),
        },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Error creating theme:", error)
    return NextResponse.json(
      { success: false, message: "Failed to create theme", error: error.message },
      { status: 500 },
    )
  }
}

