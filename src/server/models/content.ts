import type { ObjectId } from "mongodb"
import { db } from "../db"

export interface ContentItem {
  _id?: ObjectId
  type: "faq" | "homepage" | "about" | "how-it-works" | "testimonials"
  title: string
  content: string
  order: number
  isActive: boolean
  createdAt: Date
  updatedAt?: Date
  createdBy: ObjectId
}

export const contentCollection = db.collection<ContentItem>("content")

export async function findContentByType(type: ContentItem["type"]) {
  return await contentCollection.find({ type, isActive: true }).sort({ order: 1 }).toArray()
}

export async function findContentById(id: ObjectId) {
  return await contentCollection.findOne({ _id: id })
}

export async function createContent(contentData: Omit<ContentItem, "_id" | "createdAt">) {
  const content = {
    ...contentData,
    isActive: true,
    createdAt: new Date(),
  }
  const result = await contentCollection.insertOne(content)
  return { ...content, _id: result.insertedId }
}

export async function updateContent(id: ObjectId, updates: Partial<ContentItem>) {
  const updatedData = {
    ...updates,
    updatedAt: new Date(),
  }
  return await contentCollection.updateOne({ _id: id }, { $set: updatedData })
}

export async function deleteContent(id: ObjectId) {
  // Soft delete by setting isActive to false
  return await contentCollection.updateOne({ _id: id }, { $set: { isActive: false, updatedAt: new Date() } })
}

