"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from "lucide-react"
import { useRouter } from "next/navigation"

type Message = {
  id: string
  senderId: string
  receiverId: string
  content: string
  timestamp: string
}

type Conversation = {
  id: string
  userId: string
  name: string
  avatarUrl?: string
  lastMessage?: string
  unread?: number
}

export default function ChatPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    // Fetch conversations (in a real app, this would be from an API)
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
  }, [user, router])

  useEffect(() => {
    if (selectedConversation) {
      // Fetch messages for the selected conversation
      // In a real app, this would be from an API
      const mockMessages: Message[] = [
        {
          id: "m1",
          senderId: "user1",
          receiverId: user?.id || "",
          content: "Hey, how's your startup doing?",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: "m2",
          senderId: user?.id || "",
          receiverId: "user1",
          content: "It's going great! We just secured our first round of funding.",
          timestamp: new Date(Date.now() - 3500000).toISOString(),
        },
        {
          id: "m3",
          senderId: "user1",
          receiverId: user?.id || "",
          content: "That's awesome! Congratulations!",
          timestamp: new Date(Date.now() - 3400000).toISOString(),
        },
        {
          id: "m4",
          senderId: user?.id || "",
          receiverId: "user1",
          content: "Thanks! We're really excited about the future.",
          timestamp: new Date(Date.now() - 3300000).toISOString(),
        },
      ]

      setMessages(mockMessages)

      // Mark conversation as read
      setConversations((prev) => prev.map((conv) => (conv.id === selectedConversation ? { ...conv, unread: 0 } : conv)))
    }
  }, [selectedConversation, user?.id])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !selectedConversation) return

    const selectedConv = conversations.find((c) => c.id === selectedConversation)
    if (!selectedConv) return

    const newMsg: Message = {
      id: `m${Date.now()}`,
      senderId: user?.id || "",
      receiverId: selectedConv.userId,
      content: newMessage,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, newMsg])
    setNewMessage("")

    // Update last message in conversation list
    setConversations((prev) =>
      prev.map((conv) => (conv.id === selectedConversation ? { ...conv, lastMessage: newMessage } : conv)),
    )
  }

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (!user) {
    return null
  }

  return (
    <div className="container py-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[calc(100vh-12rem)]">
        {/* Conversations sidebar */}
        <div className="md:col-span-1 border rounded-lg overflow-hidden">
          <div className="p-4 border-b bg-muted/50">
            <h2 className="font-semibold">Conversations</h2>
          </div>
          <ScrollArea className="h-[calc(100%-4rem)]">
            <div className="p-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedConversation === conversation.id ? "bg-muted" : "hover:bg-muted/50"
                  }`}
                  onClick={() => setSelectedConversation(conversation.id)}
                >
                  <Avatar>
                    <AvatarImage src={conversation.avatarUrl} />
                    <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <p className="font-medium truncate">{conversation.name}</p>
                      {conversation.unread ? (
                        <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                          {conversation.unread}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{conversation.lastMessage}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Chat area */}
        <div className="md:col-span-2 border rounded-lg overflow-hidden flex flex-col">
          {selectedConversation ? (
            <>
              <div className="p-4 border-b bg-muted/50">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={conversations.find((c) => c.id === selectedConversation)?.avatarUrl} />
                    <AvatarFallback>
                      {conversations.find((c) => c.id === selectedConversation)?.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="font-semibold">{conversations.find((c) => c.id === selectedConversation)?.name}</h2>
                </div>
              </div>

              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.senderId === user.id ? "justify-end" : "justify-start"}`}
                    >
                      <div className="flex gap-2 max-w-[80%]">
                        {message.senderId !== user.id && (
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={conversations.find((c) => c.userId === message.senderId)?.avatarUrl} />
                            <AvatarFallback>
                              {conversations.find((c) => c.userId === message.senderId)?.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div>
                          <Card className={message.senderId === user.id ? "bg-primary text-primary-foreground" : ""}>
                            <CardContent className="p-3">
                              <p>{message.content}</p>
                            </CardContent>
                          </Card>
                          <p className="text-xs text-muted-foreground mt-1">{formatTime(message.timestamp)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              <div className="p-4 border-t">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <Input
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Select a conversation to start chatting
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

