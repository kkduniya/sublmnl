import { db } from "../db"
import { ObjectId } from "mongodb"

// Collection reference
export const passwordResetCollection = db.collection("passwordResets")

export async function createPasswordReset(userId, token, expiresAt) {
  try {
    // Delete any existing reset tokens for this user first
    // Using deleteOne with a filter that matches all documents for this userId
    await passwordResetCollection.deleteOne({ userId: new ObjectId(userId) })

    // Create a new password reset token
    const passwordReset = {
      userId: new ObjectId(userId),
      token,
      expiresAt,
      createdAt: new Date(),
    }

    const result = await passwordResetCollection.insertOne(passwordReset)
    return { ...passwordReset, _id: result.insertedId }
  } catch (error) {
    console.error("Error creating password reset token:", error)
    throw error
  }
}

export async function findValidToken(token) {
  try {
    return await passwordResetCollection.findOne({
      token,
      expiresAt: { $gt: new Date() }, // Token must not be expired
    })
  } catch (error) {
    console.error("Error finding valid token:", error)
    throw error
  }
}

export async function deleteToken(tokenId) {
  try {
    return await passwordResetCollection.deleteOne({ _id: new ObjectId(tokenId) })
  } catch (error) {
    console.error("Error deleting token:", error)
    throw error
  }
}

// Function to delete all tokens for a user
export async function deleteAllUserTokens(userId) {
  try {
    return await passwordResetCollection.deleteOne({ userId: new ObjectId(userId) })
  } catch (error) {
    console.error("Error deleting user tokens:", error)
    throw error
  }
}

// Password reset schema documentation (for reference)
/*
PasswordReset object structure:
{
  _id: ObjectId,
  userId: ObjectId,
  token: String,
  expiresAt: Date,
  createdAt: Date
}
*/
