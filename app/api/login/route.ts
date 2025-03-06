import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    // Validate input
    if (!email || !password) {
      return NextResponse.json({ message: "Email and password are required" }, { status: 400 })
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

      // Since we just created an empty database, no users exist yet
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    // Read users from db.json
    const dbData = JSON.parse(fs.readFileSync(dbPath, "utf8"))
    const users = dbData.users || []

    // Find user by email
    const user = users.find((u: any) => u.email === email)

    // Check if user exists and password matches
    if (!user || user.password !== password) {
      return NextResponse.json({ message: "Invalid email or password" }, { status: 401 })
    }

    // Don't send password back to client
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

