import { Suspense } from "react"
import { Feed } from "@/components/feed"
import { FeedSkeleton } from "@/components/skeletons/feed-skeleton"

export default function Home() {
  return (
    <div className="container py-6 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6">Startup Feed</h1>
      <Suspense fallback={<FeedSkeleton />}>
        <Feed />
      </Suspense>
    </div>
  )
}

