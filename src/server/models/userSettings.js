import { ObjectId } from "mongodb";
import { db } from "../db";

const userSettingsCollection = db.collection("userSettings");

/**
 * Get user audio settings for a specific user.
 * @param {string | ObjectId} userId - The ID of the user.
 * @returns {Promise<Object | null>} The user's audio settings or null if not found.
 */
export async function getUserAudioSettings(userId=null) {
  try {
    // const objectId = typeof userId === "string" ? new ObjectId(userId) : userId;
    return await userSettingsCollection.findOne({ type: "audio" });
  } catch (error) {
    console.error("Error fetching user audio settings:", error);
    return null;
  }
}

/**
 * Update or insert user audio settings.
 * @param {string | ObjectId} userId - The ID of the user.
 * @param {Object} settings - Partial settings to update.
 * @param {boolean} isAdmin - Whether the user is an admin (allows updating global settings).
 * @returns {Promise<Object>} The result of the update operation.
 */
export async function updateUserAudioSettings(userId, settings, isAdmin = false) {
  try {
    console.log(userId, settings, "userid my settings", "isAdmin:", isAdmin);
    const objectId = typeof userId === "string" ? new ObjectId(userId) : userId;

    // For admin users, update the global audio settings (not user-specific)
    // For regular users, update their specific settings
    const query = isAdmin 
      ? { type: "audio" } // Admin can update global settings
      : { userId: objectId, type: "audio" }; // Regular user updates their own settings

    const result = await userSettingsCollection.updateOne(
      query,
      { 
        $set: { ...settings, updatedAt: new Date() },
        $setOnInsert: { userId: objectId, type: "audio" }
      },
      { upsert: true } // Ensures an insert if no document exists
    );

    console.log("Update result:", result);

    return {
      acknowledged: result.acknowledged,
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedCount: result.upsertedCount || 0,
      upsertedId: result.upsertedId || null,
    };
  } catch (error) {
    console.error("Error updating user audio settings:", error);
    return {
      acknowledged: false,
      matchedCount: 0,
      modifiedCount: 0,
      upsertedCount: 0,
      upsertedId: null,
    };
  }
}
