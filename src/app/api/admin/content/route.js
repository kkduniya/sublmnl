import { NextResponse } from "next/server"
import { connectToDatabase } from "@/server/db"
import { ObjectId } from "mongodb"

export async function GET(request) {
  try {
    // Get content type from query params
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "homepage"
    const limit = searchParams.get("limit")
    const page = searchParams.get("page") || "1"

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

    // Connect to the database
    const db = await connectToDatabase()

    // Build query
    let query = { type, isActive: true }

    // Fetch content items
    let contentQuery = db.collection("content").find(query).sort({ order: 1 })

    // Add pagination if limit is specified
    if (limit) {
      const limitNum = parseInt(limit)
      const skip = (parseInt(page) - 1) * limitNum
      contentQuery = contentQuery.skip(skip).limit(limitNum)
    }

    const contentItems = await contentQuery.toArray()

    // Transform the data to ensure _id is a string and parse structured content
    const formattedContent = contentItems.map((item) => {
      const structuredTypes = [
        'testimonials', 'categories', 'features', 'process', 'statistics', 
        'hero', 'content-blocks', 'trust', 'section-headers', 'cta-section'
      ]
      
      let parsedContent = null
      if (structuredTypes.includes(item.type)) {
        try {
          // Check if content exists and is a valid string
          if (item.content && typeof item.content === 'string' && item.content.trim() !== '' && item.content !== 'undefined') {
            parsedContent = JSON.parse(item.content)
          } else {
            console.warn(`Invalid or empty content for item ${item._id}:`, item.content)
            parsedContent = {}
          }
        } catch (error) {
          console.error(`Error parsing content for item ${item._id}:`, error)
          parsedContent = {}
        }
      }

      return {
        ...item,
        _id: item._id.toString(),
        parsedContent,
        // Ensure content is always a string
        content: item.content || ''
      }
    })

    // Get total count for pagination
    let totalCount = 0
    if (limit) {
      totalCount = await db.collection("content").countDocuments(query)
    }

    const response = {
      success: true,
      content: formattedContent,
    }

    if (limit) {
      response.pagination = {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        pages: Math.ceil(totalCount / parseInt(limit))
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("Error fetching content:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch content",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

export async function POST(request) {
  try {
    const { title, content, order, type } = await request.json()

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

    // Type-specific validation
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

    const newContentItem = {
      title,
      content: typeof content === 'string' ? content : JSON.stringify(content),
      order: order || 0,
      type,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: new ObjectId(), // In a real app, this would be the user's ID
    }

    const result = await db.collection("content").insertOne(newContentItem)

    return NextResponse.json({
      success: true,
      content: {
        ...newContentItem,
        _id: result.insertedId.toString(),
      },
    })
  } catch (error) {
    console.error("Error creating content:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create content",
        error: error.message,
      },
      { status: 500 },
    )
  }
}
