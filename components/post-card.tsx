"use client"

import { Input } from "@/components/ui/input"

import type React from "react"

import { useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Heart, MessageCircle, Share2, MoreVertical, Edit, Trash2 } from "lucide-react"
import Link from "next/link"

type Post = {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  startupName?: string
  content: string
  imageUrl?: string
  likes: number
  comments: number
  shares: number
  createdAt: string
  liked?: boolean
}

type User = {
  id: string
  name: string
  email: string
  startupName?: string
  bio?: string
  avatarUrl?: string
}

type PostCardProps = {
  post: Post
  currentUser: User | null
  onLike: (postId: string) => void
  onDelete: (postId: string) => void
}

export function PostCard({ post, currentUser, onLike, onDelete }: PostCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedContent, setEditedContent] = useState(post.content)
  const [showComments, setShowComments] = useState(false)
  const [commentText, setCommentText] = useState("")

  const isOwner = currentUser?.id === post.userId

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
      Math.round((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      "day",
    )
  }

  const handleSaveEdit = () => {
    // In a real app, send a request to update the post
    console.log("Saving edited post:", editedContent)
    setIsEditing(false)
    // Update the post in the parent component
  }

  const handleLike = async () => {
    if (!currentUser) return

    try {
      // Send like to API
      const response = await fetch(`/api/posts/${post.id}/like`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.id,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to like post")
      }

      // Update UI
      onLike(post.id)
    } catch (error) {
      console.error("Error liking post:", error)
      // Fallback to local state for demo
      onLike(post.id)
    }
  }

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || !currentUser) return

    try {
      // Send comment to API
      const response = await fetch(`/api/posts/${post.id}/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: currentUser.id,
          content: commentText,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add comment")
      }

      // Clear comment input
      setCommentText("")

      // Refresh comments (in a real app, you would add the new comment to the list)
      // For this demo, we'll just increment the comment count
      post.comments += 1
    } catch (error) {
      console.error("Error adding comment:", error)
      // For demo purposes
      setCommentText("")
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={post.userAvatar} />
              <AvatarFallback>{post.userName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">
                <Link href={`/profile/${post.userId}`} className="hover:underline">
                  {post.userName}
                </Link>
                {post.startupName && <span className="text-muted-foreground"> • {post.startupName}</span>}
              </div>
              <div className="text-xs text-muted-foreground">{formatDate(post.createdAt)}</div>
            </div>
          </div>

          {isOwner && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">More options</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => onDelete(post.id)}>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        {isEditing ? (
          <div className="space-y-2">
            <Textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="min-h-[100px]"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSaveEdit}>
                Save
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="whitespace-pre-line">{post.content}</p>
            {post.imageUrl && (
              <div className="mt-3 rounded-md overflow-hidden">
                <img
                  src={post.imageUrl || "/placeholder.svg"}
                  alt="Post attachment"
                  className="w-full h-auto object-cover"
                />
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter className="pt-0 flex flex-col">
        <div className="flex items-center justify-between w-full py-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            className={`gap-1 ${post.liked ? "text-red-500" : ""}`}
            onClick={handleLike}
          >
            <Heart className={`h-4 w-4 ${post.liked ? "fill-current" : ""}`} />
            <span>{post.likes}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-1" onClick={() => setShowComments(!showComments)}>
            <MessageCircle className="h-4 w-4" />
            <span>{post.comments}</span>
          </Button>
          <Button variant="ghost" size="sm" className="gap-1">
            <Share2 className="h-4 w-4" />
            <span>{post.shares}</span>
          </Button>
        </div>

        {showComments && (
          <div className="w-full pt-3 border-t">
            <h4 className="font-medium mb-2">Comments</h4>
            <div className="space-y-3">
              {/* In a real app, map through comments */}
              <div className="flex gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1 bg-muted p-2 rounded-md">
                  <div className="font-medium text-sm">User Name</div>
                  <p className="text-sm">This is a sample comment.</p>
                </div>
              </div>

              {currentUser && (
                <form onSubmit={handleSubmitComment} className="flex gap-2 mt-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.avatarUrl} />
                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex gap-2">
                    <Input
                      placeholder="Write a comment..."
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className="flex-1"
                    />
                    <Button type="submit" size="sm">
                      Post
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}

