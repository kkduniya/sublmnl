import { MongoClient } from "mongodb"

// Make sure your DATABASE_URL is correctly set in your environment variables
const uri = process.env.DATABASE_URL || "mongodb+srv://kkduniya:bjnrDEC12@cluster0.ivq4nvd.mongodb.net/sublmnl"

let client
let clientPromise

// Check if we're already connected
if (!global._mongoClientPromise) {
  client = new MongoClient(uri)
  global._mongoClientPromise = client.connect()

  // Add logging to debug connection issues
  global._mongoClientPromise
    .then(() => console.log("Successfully connected to MongoDB at:", uri))
    .catch((err) => console.error("Failed to connect to MongoDB:", err))
}

clientPromise = global._mongoClientPromise

export const connectToDatabase = async () => {
  try {
    const client = await clientPromise
    const db = client.db() // Explicitly specify your database name
    console.log("Connected to database name :", db.databaseName)
    return db
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error)
    throw error
  }
}

// Export a db object that can be used directly
export const db = {
  collection: (name) => {
    return {
      findOne: async (query) => {
        const database = await connectToDatabase()
        return database.collection(name).findOne(query)
      },
      find: (query) => {
        return {
          sort: (sortOptions) => {
            return {
              toArray: async () => {
                const database = await connectToDatabase()
                return database.collection(name).find(query).sort(sortOptions).toArray()
              },
            }
          },
          toArray: async () => {
            const database = await connectToDatabase()
            return database.collection(name).find(query).toArray()
          },
        }
      },
      insertOne: async (doc) => {
        const database = await connectToDatabase()
        return database.collection(name).insertOne(doc)
      },
      updateOne: async (query, update) => {
        const database = await connectToDatabase()
        return database.collection(name).updateOne(query, update)
      },
      deleteOne: async (query) => {
        const database = await connectToDatabase()
        return database.collection(name).deleteOne(query)
      },
    }
  },
}

