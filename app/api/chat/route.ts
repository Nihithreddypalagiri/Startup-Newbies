import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

// GET messages for a conversation
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const conversationId = url.searchParams.get("conversationId")

    if (!conversationId) {
      return NextResponse.json({ message: "Conversation ID is required" }, { status: 400 })
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
      return NextResponse.json({ messages: [] })
    }

    const dbData = JSON.parse(fs.readFileSync(dbPath, "utf8"))
    const messages = dbData.messages || []

    // Filter messages for the conversation
    const conversationMessages = messages.filter((message: any) => message.conversationId === conversationId)

    // Sort messages by timestamp
    conversationMessages.sort((a: any, b: any) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())

    return NextResponse.json({ messages: conversationMessages })
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

// POST a new message
export async function POST(request: Request) {
  try {
    const { senderId, receiverId, content, conversationId } = await request.json()

    if (!senderId || !receiverId || !content) {
      return NextResponse.json({ message: "Sender ID, receiver ID, and content are required" }, { status: 400 })
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

    // Create or get conversation ID
    let messageConversationId = conversationId
    if (!messageConversationId) {
      // Create a new conversation ID if not provided
      // In a real app, you would check if a conversation already exists
      messageConversationId = uuidv4()
    }

    // Create new message
    const newMessage = {
      id: uuidv4(),
      conversationId: messageConversationId,
      senderId,
      receiverId,
      content,
      timestamp: new Date().toISOString(),
      read: false,
    }

    // Add message to db
    dbData.messages = [...(dbData.messages || []), newMessage]

    // Write to db.json
    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2))
    console.log("Message sent successfully and saved to db.json")

    return NextResponse.json({ message: "Message sent successfully", data: newMessage }, { status: 201 })
  } catch (error) {
    console.error("Error sending message:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

