import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function PUT(request: Request) {
  try {
    const { id, name, email, startupName, bio, avatarUrl } = await request.json()

    if (!id || !name || !email) {
      return NextResponse.json({ message: "User ID, name, and email are required" }, { status: 400 })
    }

    // Ensure server directory exists
    const serverDir = path.join(process.cwd(), "server")
    const dbPath = path.join(serverDir, "db.json")

    // Check if server directory exists, if not create it
    if (!fs.existsSync(serverDir)) {
      fs.mkdirSync(serverDir, { recursive: true })
      console.log("Created server directory at:", serverDir)
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Check if db.json exists
    if (!fs.existsSync(dbPath)) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    const dbData = JSON.parse(fs.readFileSync(dbPath, "utf8"))
    const users = dbData.users || []

    // Find user index
    const userIndex = users.findIndex((u: any) => u.id === id)

    if (userIndex === -1) {
      return NextResponse.json({ message: "User not found" }, { status: 404 })
    }

    // Update user
    const updatedUser = {
      ...users[userIndex],
      name,
      startupName,
      bio,
      avatarUrl,
      updatedAt: new Date().toISOString(),
    }

    // Don't update email (as per requirements)

    // Update user in db
    dbData.users[userIndex] = updatedUser

    // Write to db.json
    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2))
    console.log("User profile updated successfully and saved to db.json")

    // Don't send password back to client
    const { password: _, ...userWithoutPassword } = updatedUser

    return NextResponse.json({ user: userWithoutPassword })
  } catch (error) {
    console.error("Error updating profile:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

