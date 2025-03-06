"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { PostCard } from "@/components/post-card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from "lucide-react"
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

export function Feed() {
  const { user } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [activeTab, setActiveTab] = useState("all")

  useEffect(() => {
    // In a real app, fetch posts from an API
    const fetchPosts = async () => {
      try {
        const response = await fetch("/api/posts")
        const data = await response.json()
        setPosts(data.posts)
      } catch (error) {
        console.error("Error fetching posts:", error)
        // Use mock data for demo
        const mockPosts: Post[] = [
          {
            id: "1",
            userId: "user1",
            userName: "Jane Cooper",
            userAvatar: "/placeholder.svg?height=40&width=40",
            startupName: "TechInnovate",
            content: "Just launched our beta product! Check it out at techinnnovate.example.com",
            likes: 24,
            comments: 5,
            shares: 3,
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: "2",
            userId: "user2",
            userName: "Alex Morgan",
            userAvatar: "/placeholder.svg?height=40&width=40",
            startupName: "GreenSolutions",
            content: "Looking for beta testers for our new eco-friendly app. DM if interested!",
            imageUrl: "/placeholder.svg?height=400&width=600",
            likes: 15,
            comments: 8,
            shares: 2,
            createdAt: new Date(Date.now() - 7200000).toISOString(),
          },
          {
            id: "3",
            userId: "user3",
            userName: "Sam Wilson",
            startupName: "FinTech Innovations",
            content:
              "We're excited to announce our seed funding round of $2M! Thanks to all our investors for believing in our vision.",
            likes: 56,
            comments: 12,
            shares: 8,
            createdAt: new Date(Date.now() - 86400000).toISOString(),
          },
        ]
        setPosts(mockPosts)
      }
    }

    fetchPosts()
  }, [])

  const handleLikePost = (postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId
          ? {
              ...post,
              likes: post.liked ? post.likes - 1 : post.likes + 1,
              liked: !post.liked,
            }
          : post,
      ),
    )
  }

  const handleDeletePost = (postId: string) => {
    setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId))
  }

  const filteredPosts =
    activeTab === "following" && user
      ? posts.filter((post) => post.userId !== user.id) // In a real app, filter by followed users
      : posts

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">All Posts</TabsTrigger>
            <TabsTrigger value="following" disabled={!user}>
              Following
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {user && (
          <Link href="/create-post">
            <Button size="sm" className="ml-4">
              <Plus className="mr-2 h-4 w-4" /> Create Post
            </Button>
          </Link>
        )}
      </div>

      <div className="space-y-6">
        {filteredPosts.map((post) => (
          <PostCard key={post.id} post={post} currentUser={user} onLike={handleLikePost} onDelete={handleDeletePost} />
        ))}

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No posts to display</p>
            {user && (
              <Link href="/create-post">
                <Button variant="outline" className="mt-4">
                  Create your first post
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

