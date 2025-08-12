import type { ObjectId } from "mongodb"
import { db } from "../db"

export interface MusicTrack {
  _id?: ObjectId
  name: string
  artist?: string
  category: string
  path: string
  duration: number
  isActive: boolean
  createdAt: Date
  updatedAt?: Date
}

export const musicCollection = db.collection<MusicTrack>("music")

export async function findAllMusicTracks() {
  return await musicCollection.find({ isActive: true }).sort({ name: 1 }).toArray()
}

export async function findMusicTracksByCategory(category: string) {
  return await musicCollection.find({ category, isActive: true }).sort({ name: 1 }).toArray()
}

export async function findMusicTrackById(id: ObjectId) {
  return await musicCollection.findOne({ _id: id })
}

export async function createMusicTrack(trackData: Omit<MusicTrack, "_id" | "createdAt">) {
  const track = {
    ...trackData,
    isActive: true,
    createdAt: new Date(),
  }
  const result = await musicCollection.insertOne(track)
  return { ...track, _id: result.insertedId }
}

export async function updateMusicTrack(id: ObjectId, updates: Partial<MusicTrack>) {
  const updatedData = {
    ...updates,
    updatedAt: new Date(),
  }
  return await musicCollection.updateOne({ _id: id }, { $set: updatedData })
}

export async function deleteMusicTrack(id: ObjectId) {
  // Soft delete by setting isActive to false
  return await musicCollection.updateOne({ _id: id }, { $set: { isActive: false, updatedAt: new Date() } })
}

