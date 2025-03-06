import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const userId = url.searchParams.get("userId")

    if (!userId) {
      return NextResponse.json({ message: "User ID is required" }, { status: 400 })
    }

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
      return NextResponse.json({ conversations: [] })
    }

    const dbData = JSON.parse(fs.readFileSync(dbPath, "utf8"))
    const messages = dbData.messages || []
    const users = dbData.users || []

    // Get all conversations where the user is either sender or receiver
    const userConversations = messages.filter(
      (message: any) => message.senderId === userId || message.receiverId === userId,
    )

    // Group messages by conversation ID
    const conversationMap = new Map()

    userConversations.forEach((message: any) => {
      if (!conversationMap.has(message.conversationId)) {
        conversationMap.set(message.conversationId, [])
      }
      conversationMap.get(message.conversationId).push(message)
    })

    // Format conversations with last message and other user details
    const conversations = Array.from(conversationMap.entries()).map(([conversationId, messages]) => {
      // Sort messages by timestamp (newest first)
      messages.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

      const lastMessage = messages[0]

      // Get the other user in the conversation
      const otherUserId = lastMessage.senderId === userId ? lastMessage.receiverId : lastMessage.senderId

      const otherUser = users.find((user: any) => user.id === otherUserId)

      // Count unread messages
      const unreadCount = messages.filter((message: any) => message.receiverId === userId && !message.read).length

      return {
        id: conversationId,
        userId: otherUserId,
        name: otherUser ? otherUser.name : "Unknown User",
        avatarUrl: otherUser ? otherUser.avatarUrl : "",
        lastMessage: lastMessage.content,
        timestamp: lastMessage.timestamp,
        unread: unreadCount,
      }
    })

    // Sort conversations by last message timestamp (newest first)
    conversations.sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({ conversations })
  } catch (error) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

