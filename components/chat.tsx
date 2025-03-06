"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/router"
import { useSession } from "next-auth/react"

interface Conversation {
  id: string
  userId: string
  name: string
  avatarUrl?: string
  lastMessage?: string
  unread?: number
  timestamp?: string
}

interface Message {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: string
}

const Chat: React.FC = () => {
  const { data: session } = useSession()
  const user = session?.user
  const router = useRouter()

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState<string>("")

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    // Fetch conversations from the API
    const fetchConversations = async () => {
      try {
        const response = await fetch(`/api/conversations?userId=${user.id}`)
        const data = await response.json()
        setConversations(data.conversations || [])
      } catch (error) {
        console.error("Error fetching conversations:", error)
        // Use mock data for demonstration
        const mockConversations: Conversation[] = [
          {
            id: "1",
            userId: "user1",
            name: "Jane Cooper",
            avatarUrl: "/placeholder.svg?height=40&width=40",
            lastMessage: "Hey, how's your startup doing?",
            unread: 2,
          },
          {
            id: "2",
            userId: "user2",
            name: "Alex Morgan",
            avatarUrl: "/placeholder.svg?height=40&width=40",
            lastMessage: "Let's schedule a meeting next week",
          },
          {
            id: "3",
            userId: "user3",
            name: "Tech Ventures",
            lastMessage: "We're interested in your product",
          },
        ]

        setConversations(mockConversations)
      }
    }

    fetchConversations()
  }, [user, router])

  useEffect(() => {
    if (selectedConversation && user) {
      // Fetch messages for the selected conversation
      const fetchMessages = async () => {
        try {
          const response = await fetch(`/api/chat?conversationId=${selectedConversation}`)
          const data = await response.json()
          setMessages(data.messages || [])
        } catch (error) {
          console.error("Error fetching messages:", error)
          // Use mock data for demonstration
          const mockMessages: Message[] = [
            {
              id: "m1",
              senderId: "user1",
              receiverId: user.id,
              content: "Hey, how's your startup doing?",
              timestamp: new Date(Date.now() - 3600000).toISOString(),
            },
            {
              id: "m2",
              senderId: user.id,
              receiverId: "user1",
              content: "It's going great! We just secured our first round of funding.",
              timestamp: new Date(Date.now() - 3500000).toISOString(),
            },
            {
              id: "m3",
              senderId: "user1",
              receiverId: user.id,
              content: "That's awesome! Congratulations!",
              timestamp: new Date(Date.now() - 3400000).toISOString(),
            },
            {
              id: "m4",
              senderId: user.id,
              receiverId: "user1",
              content: "Thanks! We're really excited about the future.",
              timestamp: new Date(Date.now() - 3300000).toISOString(),
            },
          ]

          setMessages(mockMessages)
        }

        // Mark conversation as read
        setConversations((prev) =>
          prev.map((conv) => (conv.id === selectedConversation ? { ...conv, unread: 0 } : conv)),
        )
      }

      fetchMessages()
    }
  }, [selectedConversation, user])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !selectedConversation || !user) return

    const selectedConv = conversations.find((c) => c.id === selectedConversation)
    if (!selectedConv) return

    try {
      // Send message to API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          senderId: user.id,
          receiverId: selectedConv.userId,
          content: newMessage,
          conversationId: selectedConversation,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to send message")
      }

      // Add new message to the list
      setMessages((prev) => [...prev, data.data])
      setNewMessage("")

      // Update last message in conversation list
      setConversations((prev) =>
        prev.map((conv) =>
          conv.id === selectedConversation
            ? { ...conv, lastMessage: newMessage, timestamp: new Date().toISOString() }
            : conv,
        ),
      )
    } catch (error) {
      console.error("Error sending message:", error)
      // Fallback to local state for demo
      const newMsg: Message = {
        id: `m${Date.now()}`,
        senderId: user.id,
        receiverId: selectedConv.userId,
        content: newMessage,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, newMsg])
      setNewMessage("")

      setConversations((prev) =>
        prev.map((conv) => (conv.id === selectedConversation ? { ...conv, lastMessage: newMessage } : conv)),
      )
    }
  }

  return (
    <div>
      <h1>Chat</h1>
      <div>
        <h2>Conversations</h2>
        <ul>
          {conversations.map((conversation) => (
            <li key={conversation.id} onClick={() => setSelectedConversation(conversation.id)}>
              {conversation.name} - {conversation.lastMessage}
            </li>
          ))}
        </ul>
      </div>
      {selectedConversation && (
        <div>
          <h2>Messages</h2>
          <ul>
            {messages.map((message) => (
              <li key={message.id}>
                {message.senderId}: {message.content}
              </li>
            ))}
          </ul>
          <form onSubmit={handleSendMessage}>
            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} />
            <button type="submit">Send</button>
          </form>
        </div>
      )}
    </div>
  )
}

export default Chat

