import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const postId = params.id
    const { userId } = await request.json()

    if (!postId || !userId) {
      return NextResponse.json({ message: "Post ID and user ID are required" }, { status: 400 })
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

    // Find post
    const postIndex = posts.findIndex((p: any) => p.id === postId)

    if (postIndex === -1) {
      return NextResponse.json({ message: "Post not found" }, { status: 404 })
    }

    // Check if user already liked the post
    const post = posts[postIndex]
    const likedBy = post.likedBy || []
    const alreadyLiked = likedBy.includes(userId)

    if (alreadyLiked) {
      // Unlike the post
      post.likedBy = likedBy.filter((id: string) => id !== userId)
      post.likes = Math.max(0, post.likes - 1)
    } else {
      // Like the post
      post.likedBy = [...likedBy, userId]
      post.likes = (post.likes || 0) + 1
    }

    // Update post in db
    dbData.posts[postIndex] = post

    // Write to db.json
    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2))
    console.log(`Post ${alreadyLiked ? "unliked" : "liked"} successfully and saved to db.json`)

    return NextResponse.json({
      message: alreadyLiked ? "Post unliked" : "Post liked",
      liked: !alreadyLiked,
      likes: post.likes,
    })
  } catch (error) {
    console.error("Error liking post:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

