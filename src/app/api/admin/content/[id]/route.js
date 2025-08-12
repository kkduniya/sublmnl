import { NextResponse } from "next/server"
import { connectToDatabase } from "@/server/db"
import { ObjectId } from "mongodb"

export async function PUT(request, { params }) {
  try {
    // Await params before destructuring in Next.js 15
    const { id } = await params
    const { title, content, order, type } = await request.json()

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid content ID" },
        { status: 400 }
      )
    }

    // Validate required fields
    if (!title || !content || !type) {
      return NextResponse.json(
        { success: false, message: "Title, content, and type are required" },
        { status: 400 }
      )
    }

    // Validate content type
    const validTypes = [
      'homepage', 'hero', 'categories', 'features', 'process',
      'content-blocks', 'statistics', 'trust', 'testimonials',
      'faq', 'about', 'how-it-works', 'section-headers', 'cta-section'
    ]
    
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, message: "Invalid content type" },
        { status: 400 }
      )
    }

    // Validate structured content based on type
    let parsedContent
    try {
      // Check if content is valid before parsing
      if (!content || (typeof content === 'string' && (content.trim() === '' || content === 'undefined'))) {
        return NextResponse.json(
          { success: false, message: "Content cannot be empty or undefined" },
          { status: 400 }
        )
      }
      
      parsedContent = typeof content === 'string' ? JSON.parse(content) : content
    } catch (error) {
      // For non-structured content types, this is fine
      if (['homepage', 'faq', 'about', 'how-it-works'].includes(type)) {
        parsedContent = { content }
      } else {
        return NextResponse.json(
          { success: false, message: "Invalid content format for structured type" },
          { status: 400 }
        )
      }
    }

    // Type-specific validation (same as POST)
    switch (type) {
      case 'testimonials':
        if (!parsedContent.quote || !parsedContent.author || !parsedContent.role) {
          return NextResponse.json(
            { success: false, message: "Testimonials require quote, author, and role" },
            { status: 400 }
          )
        }
        break
      case 'categories':
        if (!parsedContent.title || !parsedContent.description) {
          return NextResponse.json(
            { success: false, message: "Categories require title and description" },
            { status: 400 }
          )
        }
        break
      case 'features':
        if (!parsedContent.title || !parsedContent.description) {
          return NextResponse.json(
            { success: false, message: "Features require title and description" },
            { status: 400 }
          )
        }
        break
      case 'process':
        if (!parsedContent.title || !parsedContent.description) {
          return NextResponse.json(
            { success: false, message: "Process steps require title and description" },
            { status: 400 }
          )
        }
        break
      case 'statistics':
        if (!parsedContent.value || !parsedContent.label) {
          return NextResponse.json(
            { success: false, message: "Statistics require value and label" },
            { status: 400 }
          )
        }
        break
      case 'hero':
        if (!parsedContent.title || !parsedContent.subtitle) {
          return NextResponse.json(
            { success: false, message: "Hero section requires title and subtitle" },
            { status: 400 }
          )
        }
        break
      case 'content-blocks':
        if (!parsedContent.title || !parsedContent.content) {
          return NextResponse.json(
            { success: false, message: "Content blocks require title and content" },
            { status: 400 }
          )
        }
        break
      case 'trust':
        if (!parsedContent.title || !parsedContent.subtitle) {
          return NextResponse.json(
            { success: false, message: "Trust section requires title and subtitle" },
            { status: 400 }
          )
        }
        break
      case 'section-headers':
        if (!parsedContent.sectionId || !parsedContent.title) {
          return NextResponse.json(
            { success: false, message: "Section headers require sectionId and title" },
            { status: 400 }
          )
        }
        break
      case 'cta-section':
        if (!parsedContent.title || !parsedContent.subtitle) {
          return NextResponse.json(
            { success: false, message: "CTA section requires title and subtitle" },
            { status: 400 }
          )
        }
        break
    }

    const db = await connectToDatabase()

    const updateData = {
      title,
      content: typeof content === 'string' ? content : JSON.stringify(content),
      order: order || 0,
      type,
      updatedAt: new Date(),
    }

    const result = await db
      .collection("content")
      .updateOne(
        { _id: new ObjectId(id) },
        { $set: updateData }
      )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Content not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Content updated successfully",
    })
  } catch (error) {
    console.error("Error updating content:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update content",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    // Await params before destructuring in Next.js 15
    const { id } = await params

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid content ID" },
        { status: 400 }
      )
    }

    const db = await connectToDatabase()

    // Soft delete by setting isActive to false
    const result = await db
      .collection("content")
      .updateOne(
        { _id: new ObjectId(id) },
        {
          $set: {
            isActive: false,
            deletedAt: new Date(),
            updatedAt: new Date()
          }
        }
      )

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Content not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Content deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting content:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete content",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
