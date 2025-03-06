import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    // Ensure server directory exists
    const serverDir = path.join(process.cwd(), "server")
    const dbPath = path.join(serverDir, "db.json")

    // Check if server directory exists, if not create it
    if (!fs.existsSync(serverDir)) {
      fs.mkdirSync(serverDir, { recursive: true })
      console.log("Created server directory at:", serverDir)
    }

    // Check if db.json exists, if not create it with empty data
    if (!fs.existsSync(dbPath)) {
      const initialData = JSON.stringify({ users: [], posts: [], messages: [] }, null, 2)
      fs.writeFileSync(dbPath, initialData)
      console.log("Created initial db.json file at:", dbPath)

      return NextResponse.json({
        totalUsers: 0,
        totalPosts: 0,
        totalMessages: 0,
        activeUsers: 0,
        newUsersToday: 0,
        newPostsToday: 0,
      })
    }

    const dbData = JSON.parse(fs.readFileSync(dbPath, "utf8"))
    const users = dbData.users || []
    const posts = dbData.posts || []
    const messages = dbData.messages || []

    // Calculate today's date (start of day)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Calculate stats
    const totalUsers = users.length
    const totalPosts = posts.length
    const totalMessages = messages.length

    // Calculate new users today
    const newUsersToday = users.filter((user) => {
      const createdAt = new Date(user.createdAt)
      createdAt.setHours(0, 0, 0, 0)
      return createdAt.getTime() === today.getTime()
    }).length

    // Calculate new posts today
    const newPostsToday = posts.filter((post) => {
      const createdAt = new Date(post.createdAt)
      createdAt.setHours(0, 0, 0, 0)
      return createdAt.getTime() === today.getTime()
    }).length

    // Calculate active users (users who posted or sent messages today)
    const activeUserIds = new Set()

    posts.forEach((post) => {
      const createdAt = new Date(post.createdAt)
      createdAt.setHours(0, 0, 0, 0)
      if (createdAt.getTime() === today.getTime()) {
        activeUserIds.add(post.userId)
      }
    })

    messages.forEach((message) => {
      const createdAt = new Date(message.timestamp)
      createdAt.setHours(0, 0, 0, 0)
      if (createdAt.getTime() === today.getTime()) {
        activeUserIds.add(message.senderId)
      }
    })

    const activeUsers = activeUserIds.size

    return NextResponse.json({
      totalUsers,
      totalPosts,
      totalMessages,
      activeUsers,
      newUsersToday,
      newPostsToday,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

