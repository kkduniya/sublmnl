import type { ObjectId } from "mongodb"
import { db } from "../db"
import { ObjectId as ObjectIdClass } from "mongodb"

export interface Subscription {
  _id?: ObjectId
  userId: ObjectId
  stripeSubscriptionId: string
  stripeCustomerId: string
  status: "active" | "canceled" | "past_due" | "unpaid" | "incomplete" | "incomplete_expired" | "trialing"
  currentPeriodStart: Date
  currentPeriodEnd: Date
  cancelAtPeriodEnd: boolean
  canceledAt?: Date
  metadata: Record<string, any>
  createdAt: Date
  updatedAt?: Date
}

export const subscriptionsCollection = db.collection<Subscription>("subscriptions")

export async function findUserSubscription(userId: string | ObjectId) {
  try {
    console.log(`Finding subscription for user ID: ${userId}`)

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
    const subscription = await subscriptionsCollection.find({
      userId: objectIdUserId,
    }).sort({ createdAt: -1 })
      .toArray()


    console.log(`Found subscription for user ID: ${userId}: ${subscription ? 'Yes' : 'No'}`)

    return subscription
  } catch (error) {
    console.error(`Error finding subscription for user ID ${userId}:`, error)
    throw error
  }
}

export async function findSubscriptionByStripeId(stripeSubscriptionId: string) {
  try {
    console.log(`Finding subscription by Stripe ID: ${stripeSubscriptionId}`)

    const subscription = await subscriptionsCollection.findOne({
      stripeSubscriptionId: stripeSubscriptionId,
    })

    console.log(`Found subscription by Stripe ID: ${stripeSubscriptionId}: ${subscription ? 'Yes' : 'No'}`)

    return subscription
  } catch (error) {
    console.error(`Error finding subscription by Stripe ID ${stripeSubscriptionId}:`, error)
    throw error
  }
}

export async function createSubscription(subscriptionData: Omit<Subscription, "_id" | "createdAt">) {
  try {
    console.log(`Creating new subscription for user ID: ${subscriptionData.userId}`)

    const subscriptionPayload = {
      ...subscriptionData,
      createdAt: new Date(),
    }

    const result = await subscriptionsCollection.insertOne(subscriptionPayload)
    console.log(`Subscription created with ID: ${result.insertedId}`)

    return { ...subscriptionPayload, _id: result.insertedId }
  } catch (error) {
    console.error(`Error creating subscription:`, error)
    throw error
  }
}

export async function updateSubscription(id: ObjectId, updates: Partial<Subscription>) {
  try {
    console.log(`Updating subscription with ID: ${id}`)

    const result = await subscriptionsCollection.updateOne(
      { _id: id },
      { $set: { ...updates, updatedAt: new Date() } }
    )

    console.log(`Update result: ${result.matchedCount} matched, ${result.modifiedCount} modified`)
    return result
  } catch (error) {
    console.error(`Error updating subscription ${id}:`, error)
    throw error
  }
}

export async function updateSubscriptionByStripeId(stripeSubscriptionId: string, updates: Partial<Subscription>) {
  try {
    console.log(`Updating subscription with Stripe ID: ${stripeSubscriptionId}`)

    const result = await subscriptionsCollection.updateOne(
      { stripeSubscriptionId: stripeSubscriptionId },
      { $set: { ...updates, updatedAt: new Date() } }
    )

    console.log(`Update result: ${result.matchedCount} matched, ${result.modifiedCount} modified`)
    return result
  } catch (error) {
    console.error(`Error updating subscription with Stripe ID ${stripeSubscriptionId}:`, error)
    throw error
  }
}

export async function deleteSubscription(id: ObjectId) {
  try {
    console.log(`Deleting subscription with ID: ${id}`)

    const result = await subscriptionsCollection.deleteOne({ _id: id })
    console.log(`Delete result: ${result.deletedCount} deleted`)

    return result
  } catch (error) {
    console.error(`Error deleting subscription ${id}:`, error)
    throw error
  }
}

export async function findAllSubscriptions() {
  try {
    console.log(`Finding all subscriptions`)

    const subscriptions = await subscriptionsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray()

    console.log(`Found ${subscriptions.length} subscriptions`)

    return subscriptions
  } catch (error) {
    console.error(`Error finding all subscriptions:`, error)
    throw error
  }
}

export async function findActiveSubscriptions() {
  try {
    console.log(`Finding active subscriptions`)

    const subscriptions = await subscriptionsCollection
      .find({ status: "active" })
      .sort({ createdAt: -1 })
      .toArray()

    console.log(`Found ${subscriptions.length} active subscriptions`)

    return subscriptions
  } catch (error) {
    console.error(`Error finding active subscriptions:`, error)
    throw error
  }
}

// Add this to your server/models/Subscription.ts file
export async function findActiveSubscriptionByUserId(userId: string | ObjectId) {
  try {
    console.log(`Finding active subscription for user ID: ${userId}`);

    // Convert string userId to ObjectId for querying
    let objectIdUserId: ObjectId;

    if (typeof userId === "string") {
      try {
        objectIdUserId = new ObjectIdClass(userId);
      } catch (error) {
        console.error(`Invalid ObjectId format: ${userId}`, error);
        throw new Error(`Invalid ObjectId format: ${userId}`);
      }
    } else {
      objectIdUserId = userId;
    }

    // Query for active subscription
    const subscription = await subscriptionsCollection.findOne({
      userId: objectIdUserId,
      status: "active",
      currentPeriodEnd: { $gt: new Date() } // Make sure it hasn't expired
    });

    console.log(`Found active subscription for user ID: ${userId}: ${subscription ? 'Yes' : 'No'}`);

    return subscription;
  } catch (error) {
    console.error(`Error finding active subscription for user ID ${userId}:`, error);
    throw error;
  }
}