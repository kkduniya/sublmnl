const fs = require("fs")
const path = require("path")

// Define the uploads directory path
const uploadsDir = path.join(process.cwd(), "public", "uploads")

// Create the directory if it doesn't exist
if (!fs.existsSync(uploadsDir)) {
  try {
    fs.mkdirSync(uploadsDir, { recursive: true })
    console.log(`Created uploads directory at: ${uploadsDir}`)
  } catch (error) {
    console.error(`Error creating uploads directory: ${error.message}`)
    process.exit(1)
  }
} else {
  console.log(`Uploads directory already exists at: ${uploadsDir}`)
}

console.log("Setup complete!")

