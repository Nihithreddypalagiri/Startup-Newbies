import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export async function GET() {
  try {
    // Ensure server directory exists
    const serverDir = path.join(process.cwd(), "server")
    const dbPath = path.join(serverDir, "db.json")

    // Check if server directory and db.json exist
    if (!fs.existsSync(serverDir)) {
      fs.mkdirSync(serverDir, { recursive: true })
      console.log("Created server directory at:", serverDir)
    }

    if (!fs.existsSync(dbPath)) {
      const initialData = JSON.stringify({ users: [], posts: [], messages: [] }, null, 2)
      fs.writeFileSync(dbPath, initialData)
      console.log("Created initial db.json file at:", dbPath)
      return NextResponse.json({ posts: [] })
    }

    const dbData = JSON.parse(fs.readFileSync(dbPath, "utf8"))
    const posts = dbData.posts || []

    // Sort posts by createdAt (newest first)
    posts.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ posts })
  } catch (error) {
    console.error("Error fetching posts:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Read the request body once
    const requestBody = await request.json()
    const { content, imageUrl, userId: bodyUserId } = requestBody

    // Get user ID from the request headers or from the body
    const authHeader = request.headers.get("Authorization")
    let userId

    if (authHeader && authHeader.startsWith("Bearer ")) {
      // In a real app, you would validate the token
      // For this example, we'll assume the token is the user ID
      userId = authHeader.split(" ")[1]
    } else {
      // For testing purposes, get userId from the request body
      userId = bodyUserId
    }

    if (!content) {
      return NextResponse.json({ message: "Content is required" }, { status: 400 })
    }

    // Ensure server directory exists
    const serverDir = path.join(process.cwd(), "server")
    const dbPath = path.join(serverDir, "db.json")

    // Check if server directory exists, if not create it
    if (!fs.existsSync(serverDir)) {
      fs.mkdirSync(serverDir, { recursive: true })
      console.log("Created server directory at:", serverDir)
    }

    // Initialize db data
    let dbData = { users: [], posts: [], messages: [] }

    // Check if db.json exists, if not create it with empty data
    if (fs.existsSync(dbPath)) {
      dbData = JSON.parse(fs.readFileSync(dbPath, "utf8"))
    }

    // Find user
    const users = dbData.users || []
    const user = users.find((u: any) => u.id === userId)

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Create new post
    const newPost = {
      id: uuidv4(),
      userId,
      userName: user.name,
      userAvatar: user.avatarUrl,
      startupName: user.startupName,
      content,
      imageUrl,
      likes: 0,
      comments: 0,
      shares: 0,
      createdAt: new Date().toISOString(),
      likedBy: [],
      commentsList: [],
    }

    // Add post to db
    dbData.posts = [...(dbData.posts || []), newPost]

    // Write to db.json
    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2))
    console.log("Post created successfully and saved to db.json")

    return NextResponse.json({ message: "Post created successfully", post: newPost }, { status: 201 })
  } catch (error) {
    console.error("Error creating post:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

