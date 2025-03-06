import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"
import { v4 as uuidv4 } from "uuid"

export async function POST(request: Request) {
  try {
    const { name, email, password, startupName, classroomAddress } = await request.json()

    // Validate input
    if (!name || !email || !password || !startupName || !classroomAddress) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 })
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

    // Check if user already exists
    const users = dbData.users || []
    if (users.some((user: any) => user.email === email)) {
      return NextResponse.json({ message: "User with this email already exists" }, { status: 409 })
    }

    // Create new user
    const newUser = {
      id: uuidv4(),
      name,
      email,
      password,
      startupName,
      classroomAddress,
      bio: "",
      avatarUrl: "",
      createdAt: new Date().toISOString(),
    }

    // Add user to db
    dbData.users = [...users, newUser]

    // Write to db.json
    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 2))
    console.log("User registered successfully and saved to db.json")

    // Don't send password back to client
    const { password: _, ...userWithoutPassword } = newUser

    return NextResponse.json({ message: "User registered successfully", user: userWithoutPassword }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}

