"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useRouter } from "next/navigation"
import { Users, MessageSquare, FileText, Activity } from "lucide-react"

// Import the chart component
import { DashboardChart } from "@/components/dashboard-chart"
import { DashboardStats } from "@/components/dashboard-stats"

export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPosts: 0,
    totalMessages: 0,
    activeUsers: 0,
    newUsersToday: 0,
    newPostsToday: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push("/login")
      return
    }

    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/dashboard/stats")
        const data = await response.json()
        setStats(data)
      } catch (error) {
        console.error("Error fetching dashboard stats:", error)
        // Mock data for demonstration
        setStats({
          totalUsers: 125,
          totalPosts: 348,
          totalMessages: 1024,
          activeUsers: 78,
          newUsersToday: 12,
          newPostsToday: 45,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [user, router])

  if (!user) {
    return null
  }

  return (
    <div className="container py-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back, {user.name}. Here's what's happening with Start-Up Newbies.
        </p>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-3 md:w-auto">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <DashboardStats
                title="Total Users"
                value={stats.totalUsers}
                description="Total registered users"
                icon={<Users className="h-4 w-4 text-muted-foreground" />}
                trend={+15}
              />
              <DashboardStats
                title="Total Posts"
                value={stats.totalPosts}
                description="Posts created by users"
                icon={<FileText className="h-4 w-4 text-muted-foreground" />}
                trend={+32}
              />
              <DashboardStats
                title="Messages"
                value={stats.totalMessages}
                description="Total messages exchanged"
                icon={<MessageSquare className="h-4 w-4 text-muted-foreground" />}
                trend={+24}
              />
              <DashboardStats
                title="Active Users"
                value={stats.activeUsers}
                description="Users active today"
                icon={<Activity className="h-4 w-4 text-muted-foreground" />}
                trend={+8}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4">
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                  <CardDescription>New user registrations over time</CardDescription>
                </CardHeader>
                <CardContent className="pl-2">
                  <DashboardChart
                    data={[
                      { name: "Jan", value: 45 },
                      { name: "Feb", value: 52 },
                      { name: "Mar", value: 61 },
                      { name: "Apr", value: 67 },
                      { name: "May", value: 90 },
                      { name: "Jun", value: 103 },
                      { name: "Jul", value: 125 },
                    ]}
                    type="line"
                  />
                </CardContent>
              </Card>

              <Card className="col-span-3">
                <CardHeader>
                  <CardTitle>Content Engagement</CardTitle>
                  <CardDescription>Engagement metrics by content type</CardDescription>
                </CardHeader>
                <CardContent>
                  <DashboardChart
                    data={[
                      { name: "Posts", value: 348 },
                      { name: "Comments", value: 782 },
                      { name: "Likes", value: 1245 },
                      { name: "Shares", value: 237 },
                    ]}
                    type="bar"
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>User Demographics</CardTitle>
                <CardDescription>Breakdown of user types and industries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center">
                  <DashboardChart
                    data={[
                      { name: "Tech", value: 45 },
                      { name: "Finance", value: 28 },
                      { name: "Health", value: 17 },
                      { name: "Education", value: 15 },
                      { name: "Other", value: 20 },
                    ]}
                    type="pie"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest actions across the platform</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center gap-4 border-b pb-4 last:border-0">
                      <div className="rounded-full bg-primary/10 p-2">
                        {i % 3 === 0 ? (
                          <Users className="h-4 w-4 text-primary" />
                        ) : i % 3 === 1 ? (
                          <FileText className="h-4 w-4 text-primary" />
                        ) : (
                          <MessageSquare className="h-4 w-4 text-primary" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">
                          {i % 3 === 0 ? "New user registered" : i % 3 === 1 ? "New post created" : "New message sent"}
                        </p>
                        <p className="text-xs text-muted-foreground">{Math.floor(i * 10)} minutes ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

