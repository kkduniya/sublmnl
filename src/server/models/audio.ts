import type { ObjectId } from "mongodb"
import { db } from "../db"
import { ObjectId as ObjectIdClass } from "mongodb"

export interface Audio {
  _id?: ObjectId
  userId: ObjectId
  name: string
  affirmations: string[]
  musicTrack: {
    id: string
    name: string
    path: string
    duration: number
    category?: string
  }
  voiceType: string
  voiceLanguage: string
  voicePitch: number
  voiceSpeed: number
  volume: number
  isFavorite?: boolean
  createdAt: Date
  audioUrl?: string
  category?: string
  repetitionInterval?: number
  updatedAt?: Date
}

export const audiosCollection = db.collection<Audio>("audios")

export async function findUserAudios(userId: string | ObjectId) {
  try {
    console.log(`Finding audios for user ID: ${userId}`)

    // Convert string userId to ObjectId for querying
    let objectIdUserId: ObjectId

    if (typeof userId === "string") {
      try {
        objectIdUserId = new ObjectIdClass(userId)
        console.log(`Converted string userId to ObjectId: ${objectIdUserId}`)
      } catch (error) {
        console.error(`Invalid ObjectId format: ${userId}`, error)
        throw new Error(`Invalid ObjectId format: ${userId}`)
      }
    } else {
      objectIdUserId = userId
    }

    // Query with ObjectId
    const audios = await audiosCollection
      .find({
        userId: objectIdUserId,
      })
      .sort({ createdAt: -1 })
      .toArray()

    console.log(`Found ${audios.length} audios for user ID: ${userId}`)

    return audios
  } catch (error) {
    console.error(`Error finding audios for user ID ${userId}:`, error)
    throw error
  }
}

export async function findUserFavoriteAudios(userId: ObjectId, favoriteIds: ObjectId[]) {
  return await audiosCollection
    .find({ _id: { $in: favoriteIds } })
    .sort({ createdAt: -1 })
    .toArray()
}

export async function createAudio(audioData: Omit<Audio, "_id" | "createdAt">) {
  const audioPayload = {
    ...audioData,
    createdAt: new Date(),
  }
  const result = await audiosCollection.insertOne(audioPayload);
  return { ...audioPayload, _id: result.insertedId }
}

export async function findAudioById(id: ObjectId) {
  return await audiosCollection.findOne({ _id: id })
}

export async function updateAudio(id: ObjectId, updates: Partial<Audio>) {
  return await audiosCollection.updateOne({ _id: id }, { $set: { ...updates, updatedAt: new Date() } })
}

export async function deleteAudio(id: ObjectId) {
  return await audiosCollection.deleteOne({ _id: id })
}

