import type { ObjectId } from "mongodb"
import { db } from "../db"
import { ObjectId as ObjectIdClass } from "mongodb"

export interface Payment {
  _id?: ObjectId
  userId: ObjectId
  stripePaymentId: string
  amount: number
  currency: string
  status: "succeeded" | "pending" | "failed"
  type: "one-time" | "subscription"
  metadata: Record<string, any>
  audioId?: ObjectId | ObjectId[] // Support both single audio and multiple audios
  createdAt: Date
  updatedAt?: Date
}

export const paymentsCollection = db.collection<Payment>("payments")

export async function findUserPayments(userId: string | ObjectId) {
  try {
    console.log(`Finding payments for user ID: ${userId}`)

    // Convert string userId to ObjectId for querying
    let objectIdUserId: ObjectId

    if (typeof userId === "string") {
      try {
        objectIdUserId = new ObjectIdClass(userId)
        console.log(`Converted string userId to ObjectId: ${objectIdUserId}`)
      } catch (error) {
        console.error(`Invalid ObjectId format: ${userId}`, error)
        throw new Error(`Invalid ObjectId format: ${userId}`)
      }
    } else {
      objectIdUserId = userId
    }

    // Query with ObjectId
    const payments = await paymentsCollection
      .find({
        userId: objectIdUserId,
      })
      .sort({ createdAt: -1 })
      .toArray()

    console.log(`Found ${payments.length} payments for user ID: ${userId}`)

    return payments
  } catch (error) {
    console.error(`Error finding payments for user ID ${userId}:`, error)
    throw error
  }
}

export async function findPaymentByStripeId(stripePaymentId: string) {
  try {
    console.log(`Finding payment by Stripe ID: ${stripePaymentId}`)

    const payment = await paymentsCollection.findOne({
      stripePaymentId: stripePaymentId,
    })

    console.log(`Found payment by Stripe ID: ${stripePaymentId}: ${payment ? 'Yes' : 'No'}`)

    return payment
  } catch (error) {
    console.error(`Error finding payment by Stripe ID ${stripePaymentId}:`, error)
    throw error
  }
}

export async function createPayment(paymentData: Omit<Payment, "_id" | "createdAt">) {
  try {
    console.log(`Creating new payment for user ID: ${paymentData.userId}`)

    const paymentPayload = {
      ...paymentData,
      createdAt: new Date(),
    }

    const result = await paymentsCollection.insertOne(paymentPayload)
    console.log(`Payment created with ID: ${result.insertedId}`)

    return { ...paymentPayload, _id: result.insertedId }
  } catch (error) {
    console.error(`Error creating payment:`, error)
    throw error
  }
}

export async function findPaymentById(id: ObjectId) {
  try {
    console.log(`Finding payment by ID: ${id}`)

    const payment = await paymentsCollection.findOne({ _id: id })
    console.log(`Found payment by ID: ${id}: ${payment ? 'Yes' : 'No'}`)

    return payment
  } catch (error) {
    console.error(`Error finding payment by ID ${id}:`, error)
    throw error
  }
}

export async function updatePayment(id: ObjectId, updates: Partial<Payment>) {
  try {
    console.log(`Updating payment with ID: ${id}`)

    const result = await paymentsCollection.updateOne(
      { _id: id },
      { $set: { ...updates, updatedAt: new Date() } }
    )

    console.log(`Update result: ${result.matchedCount} matched, ${result.modifiedCount} modified`)
    return result
  } catch (error) {
    console.error(`Error updating payment ${id}:`, error)
    throw error
  }
}

export async function deletePayment(id: ObjectId) {
  try {
    console.log(`Deleting payment with ID: ${id}`)

    const result = await paymentsCollection.deleteOne({ _id: id })
    console.log(`Delete result: ${result.deletedCount} deleted`)

    return result
  } catch (error) {
    console.error(`Error deleting payment ${id}:`, error)
    throw error
  }
}

export async function findAllPayments() {
  try {
    console.log(`Finding all payments`)

    const payments = await paymentsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    console.log(`Found ${payments.length} payments`)

    return payments
  } catch (error) {
    console.error(`Error finding all payments:`, error)
    throw error
  }
}

export async function findSuccessfulPayments() {
  try {
    console.log(`Finding successful payments`)

    const payments = await paymentsCollection
      .find({ status: "succeeded" })
      .sort({ createdAt: -1 })
      .toArray()

    console.log(`Found ${payments.length} successful payments`)

    return payments
  } catch (error) {
    console.error(`Error finding successful payments:`, error)
    throw error
  }
}

export async function findPaymentsByType(type: "one-time" | "subscription") {
  try {
    console.log(`Finding payments by type: ${type}`)

    const payments = await paymentsCollection
      .find({ type })
      .sort({ createdAt: -1 })
      .toArray()

    console.log(`Found ${payments.length} ${type} payments`)

    return payments
  } catch (error) {
    console.error(`Error finding payments by type ${type}:`, error)
    throw error
  }
}

export async function findPaymentsByAudioId(audioId: string | ObjectId) {
  try {
    console.log(`Finding payments for audio ID: ${audioId}`)

    // Convert string audioId to ObjectId for querying
    let objectIdAudioId: ObjectId

    if (typeof audioId === "string") {
      try {
        objectIdAudioId = new ObjectIdClass(audioId)
        console.log(`Converted string audioId to ObjectId: ${objectIdAudioId}`)
      } catch (error) {
        console.error(`Invalid ObjectId format: ${audioId}`, error)
        throw new Error(`Invalid ObjectId format: ${audioId}`)
      }
    } else {
      objectIdAudioId = audioId
    }

    // Query with ObjectId
    const payments = await paymentsCollection
      .find({
        audioId: objectIdAudioId,
      })
      .sort({ createdAt: -1 })
      .toArray()

    console.log(`Found ${payments.length} payments for audio ID: ${audioId}`)

    return payments
  } catch (error) {
    console.error(`Error finding payments for audio ID ${audioId}:`, error)
    throw error
  }
}

// Add this to your server/models/Payment.ts file
export async function findSuccessfulPaymentsByUserId(userId: string | ObjectId) {
  try {
    console.log(`Finding successful payments for user ID: ${userId}`);

    // Convert string userId to ObjectId for querying
    let objectIdUserId: ObjectId;

    if (typeof userId === "string") {
      try {
        objectIdUserId = new ObjectIdClass(userId);
        console.log(`Converted string userId to ObjectId: ${objectIdUserId}`);
      } catch (error) {
        console.error(`Invalid ObjectId format: ${userId}`, error);
        throw new Error(`Invalid ObjectId format: ${userId}`);
      }
    } else {
      objectIdUserId = userId;
    }

    // Query for successful payments only
    const payments = await paymentsCollection
      .find({
        userId: objectIdUserId,
        status: "succeeded",
        audioId: null
      })
      .sort({ createdAt: -1 })
      .toArray();

    console.log(`Found ${payments.length} successful payments for user ID: ${userId}`);

    return payments;
  } catch (error) {
    console.error(`Error finding successful payments for user ID ${userId}:`, error);
    throw error;
  }
}

