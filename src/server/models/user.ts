import { ObjectId } from "mongodb"
import { db } from "../db"
import bcrypt from "bcryptjs"

export interface User {
  _id?: ObjectId
  email: string
  name?: string
  firstName?: string
  lastName?: string
  password?: string // Hashed password
  role: "user" | "admin" // Added role for admin functionality
  createdAt: Date
  favoriteAudios?: ObjectId[] // Added for favorite functionality
  subscription?: {
    plan: "basic" | "premium" | "ultimate"
    status: "active" | "cancelled" | "expired"
    expiresAt: Date
  }
}

export const usersCollection = db.collection("users")

export async function findUserByEmail(email: string) {
  try {
    console.log(`Finding user by email: ${email}`)
    const user = await usersCollection.findOne({ email })
    console.log(`User found: ${user ? "Yes" : "No"}`)
    return user
  } catch (error) {
    console.error(`Error finding user by email ${email}:`, error)
    throw error
  }
}

export async function createUser(userData: Omit<User, "_id" | "createdAt">) {
  try {
    console.log(`Creating new user with email: ${userData.email}`)
    
    // Hash password if provided
    let userToCreate = { ...userData }
    if (userToCreate.password) {
      userToCreate.password = await bcrypt.hash(userToCreate.password, 10)
    }
    
    const user = {
      ...userToCreate,
      role: userToCreate.role || "user", // Default to user role
      createdAt: new Date(),
    }
    
    const result = await usersCollection.insertOne(user)
    console.log(`User created with ID: ${result.insertedId}`)
    return { ...user, _id: result.insertedId }
  } catch (error) {
    console.error(`Error creating user:`, error)
    throw error
  }
}

export async function findUserById(id: string | ObjectId) {
  try {
    const objectId = typeof id === "string" ? new ObjectId(id) : id
    console.log(`Finding user by ID: ${objectId}`)
    const user = await usersCollection.findOne({ _id: objectId })
    console.log(`User found: ${user ? "Yes" : "No"}`)
    return user
  } catch (error) {
    console.error(`Error finding user by ID ${id}:`, error)
    throw error
  }
}

export async function findUsersById(ids: ObjectId[]) {
  try {
    console.log(`Finding users by IDs: ${ids.join(', ')}`)
    const users = await usersCollection.find({ _id: { $in: ids } }).toArray()
    console.log(`Users found: ${users.length}`)
    return users
  } catch (error) {
    console.error(`Error finding users by IDs ${ids.join(', ')}:`, error)
    throw error
  }
}

export async function updateUser(id: ObjectId, updates: Partial<User>) {
  try {
    console.log(`Updating user with ID: ${id}`, updates)
    
    // If updating password, hash it first
    let updatesToApply = { ...updates }
    if (updatesToApply.password) {
      updatesToApply.password = await bcrypt.hash(updatesToApply.password, 10)
    }
    
    const result = await usersCollection.updateOne({ _id: id }, { $set: updatesToApply })
    console.log(`Update result: ${result.matchedCount} matched, ${result.modifiedCount} modified`)
    return result
  } catch (error) {
    console.error(`Error updating user ${id}:`, error)
    throw error
  }
}

export async function addFavoriteAudio(userId: ObjectId, audioId: ObjectId) {
  try {
    console.log(`Adding audio ${audioId} to favorites for user ${userId}`)
    const result = await usersCollection.updateOne({ _id: userId }, { $addToSet: { favoriteAudios: audioId } })
    console.log(`Update result: ${result.matchedCount} matched, ${result.modifiedCount} modified`)
    return result
  } catch (error) {
    console.error(`Error adding favorite audio for user ${userId}:`, error)
    throw error
  }
}

export async function removeFavoriteAudio(userId: ObjectId, audioId: ObjectId) {
  try {
    console.log(`Removing audio ${audioId} from favorites for user ${userId}`)
    const result = await usersCollection.updateOne({ _id: userId }, { $pull: { favoriteAudios: audioId } })
    console.log(`Update result: ${result.matchedCount} matched, ${result.modifiedCount} modified`)
    return result
  } catch (error) {
    console.error(`Error removing favorite audio for user ${userId}:`, error)
    throw error
  }
}

export async function findAdminUsers() {
  try {
    console.log(`Finding admin users`)
    const users = await usersCollection.find({ role: "admin" }).toArray()
    console.log(`Found ${users.length} admin users`)
    return users
  } catch (error) {
    console.error(`Error finding admin users:`, error)
    throw error
  }
}

// Helper function to verify password - useful for NextAuth.js
export async function verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(plainPassword, hashedPassword)
  } catch (error) {
    console.error("Error verifying password:", error)
    return false
  }
}