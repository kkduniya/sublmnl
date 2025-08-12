import { NextResponse } from "next/server"
import { connectToDatabase } from "@/server/db"
import { ObjectId } from "mongodb"

export async function GET(request) {
  try {
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page")) || 1
    const limit = Number.parseInt(searchParams.get("limit")) || 10
    const search = searchParams.get("search") || ""
    const sortField = searchParams.get("sortField") || "createdAt"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    // Connect to the database
    const db = await connectToDatabase()

    // Build query
    let query = {}

    // Add search functionality
    if (search) {
      query = {
        $or: [
          { firstName: { $regex: search, $options: "i" } },
          { lastName: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
          { role: { $regex: search, $options: "i" } },
        ],
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Get total count for pagination
    const totalCount = await db.collection("users").countDocuments(query)

    // Fetch users with pagination and sorting
    const users = await db
      .collection("users")
      .find(query)
      .sort({ [sortField]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .toArray()

    // Transform the data to ensure _id is a string
    const formattedUsers = users.map((user) => ({
      ...user,
      _id: user._id.toString(),
    }))

    return NextResponse.json({
      success: true,
      users: formattedUsers,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = params
    const { role } = await request.json()

    if (!id || !role) {
      return NextResponse.json({ success: false, message: "User ID and role are required" }, { status: 400 })
    }

    const db = await connectToDatabase()

    const result = await db.collection("users").updateOne({ _id: new ObjectId(id) }, { $set: { role } })

    if (result.matchedCount === 0) {
      return NextResponse.json({ success: false, message: "User not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      message: "User role updated successfully",
    })
  } catch (error) {
    console.error("Error updating user role:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update user role",
        error: error.message,
      },
      { status: 500 },
    )
  }
}

