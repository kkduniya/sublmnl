import { ObjectId } from "mongodb"
import { db } from "../db"

// Create a collection for themes
const themesCollection = db.collection("themes")

// Function to find all themes
export async function findAllThemes() {
  return await themesCollection.find({}).sort({ createdAt: -1 }).toArray()
}

// Function to find a theme by ID
export async function findThemeById(id) {
  return await themesCollection.findOne({ _id: new ObjectId(id) })
}

// Function to find the default theme
export async function findDefaultTheme() {
  return await themesCollection.findOne({ isDefault: true })
}

// Function to create a new theme
export async function createTheme(themeData) {
  // If this is the first theme, make it default
  const count = await themesCollection.countDocuments()
  if (count === 0) {
    themeData.isDefault = true
  }

  // Add timestamps
  const theme = {
    ...themeData,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const result = await themesCollection.insertOne(theme)
  return { ...theme, _id: result.insertedId }
}

// Function to update a theme
export async function updateTheme(id, updates) {
  // Add updated timestamp
  updates.updatedAt = new Date()

  // If setting as default, unset all other themes
  if (updates.isDefault) {
    await themesCollection.updateMany({ _id: { $ne: id } }, { $set: { isDefault: false } })
  }

  return await themesCollection.updateOne({ _id: new ObjectId(id) }, { $set: updates })
}

// Function to delete a theme
export async function deleteTheme(id) {
  // Check if this is the default theme
  const theme = await findThemeById(id)
  if (!theme) {
    throw new Error("Theme not found")
  }

  // Don't allow deleting the default theme if it's the only one
  if (theme.isDefault) {
    const count = await themesCollection.countDocuments()
    if (count <= 1) {
      throw new Error("Cannot delete the default theme")
    }

    // If deleting the default theme, set another one as default
    const anotherTheme = await themesCollection.findOne({ _id: { $ne: id } })
    if (anotherTheme) {
      await themesCollection.updateOne({ _id: anotherTheme._id }, { $set: { isDefault: true } })
    }
  }

  return await themesCollection.deleteOne({ _id: new ObjectId(id) })
}

// Function to set a theme as default
export async function setDefaultTheme(id) {
  // First, unset all themes as default
  await themesCollection.updateMany({}, { $set: { isDefault: false } })

  // Then set the specified theme as default
  return await themesCollection.updateOne({ _id: new ObjectId(id) }, { $set: { isDefault: true } })
}

