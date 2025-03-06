import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const postId = params.id
    const { userId, content } = await request.json()

    if (!postId || !userId || !content) {
      return NextResponse.json({ message: "Post ID, user ID, and content are required" }, { status: 400 })
    }

    // Ensure server directory exists
    const serverDir = path.join(process.cwd(), "server")
    const dbPath = path.join(serverDir, "db.json")

    // Check if server directory exists, if not create it
    if (!fs.existsSync(serverDir)) {
      fs.mkdirSync(serverDir, { recursive: true })
      console.log("Created server directory at:", serverDir)
      return NextResponse.json({ message: "Post not found" }, { status: 404 })
    }

    // Check if db.json exists
    if (!fs.existsSync(dbPath)) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 })
    }

    const dbData = JSON.parse(fs.readFileSync(dbPath, "utf8"))
    const posts = dbData.posts || []
    const users = dbData.users || []

    // Find post
    const postIndex = posts.findIndex((p: any) => p.id === postId)

    if (postIndex === -1) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 })
    }

    // Find user
    const user = users.find((u: any) => u.id === userId)

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Create new comment
    const newComment = {
      id: uuidv4(),
      userId,
      userName: user.name,
      userAvatar: user.avatarUrl,
      content,
      createdAt: new Date().toISOString(),
    }

    // Add comment to post
    const post = posts[postIndex]
    post.commentsList = [...(post.commentsList || []), newComment]
    post.comments = (post.comments || 0) + 1

    // Update post in db
    dbData.posts[postIndex] = post

    // Write to db.json
    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2))
    console.log("Comment added successfully and saved to db.json")

    return NextResponse.json({
      message: "Comment added",
      comment: newComment,
      comments: post.comments,
    })
  } catch (error) {
    console.error("Error adding comment:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const postId = params.id

    if (!postId) {
      return NextResponse.json({ message: "Post ID is required" }, { status: 400 })
    }

    // Ensure server directory exists
    const serverDir = path.join(process.cwd(), "server")
    const dbPath = path.join(serverDir, "db.json")

    // Check if server directory exists, if not create it
    if (!fs.existsSync(serverDir)) {
      fs.mkdirSync(serverDir, { recursive: true })
      console.log("Created server directory at:", serverDir)
      return NextResponse.json({ comments: [] })
    }

    // Check if db.json exists
    if (!fs.existsSync(dbPath)) {
      return NextResponse.json({ comments: [] })
    }

    const dbData = JSON.parse(fs.readFileSync(dbPath, "utf8"))
    const posts = dbData.posts || []

    // Find post
    const post = posts.find((p: any) => p.id === postId)

    if (!post) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 })
    }

    // Get comments
    const comments = post.commentsList || []

    // Sort comments by createdAt (newest first)
    comments.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

    return NextResponse.json({ comments })
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

