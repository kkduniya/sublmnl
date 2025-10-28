// app/api/stripe/webhook/route.js
import { NextResponse } from "next/server"
import { headers } from "next/headers"
import Stripe from "stripe"
import { connectToDatabase } from "@/server/db"
import { createPayment, findPaymentByStripeId, updatePayment } from "@/server/models/Payment"
import { createSubscription, findSubscriptionByStripeId, updateSubscriptionByStripeId, findActiveSubscriptionByUserId } from "@/server/models/Subscription"
import { updateUser, findUserById } from "@/server/models/user"
import { ObjectId } from "mongodb"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

export async function POST(req) {
  const body = await req.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "Missing stripe signature" }, { status: 400 })
  }

  let event

  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error(`Webhook signature verification failed: ${err.message}`)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  try {
    // Connect to database
    await connectToDatabase()

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object
        const { userId, audioId } = session.metadata || {}

        if (!userId) {
          console.error("Missing userId in session metadata")
          return NextResponse.json({ error: "Missing userId" }, { status: 400 })
        }

        const userObjectId = new ObjectId(userId)

        if (session.mode === "payment") {
          // Handle multiple audio purchases
          if (session.metadata?.purchaseType === "multiple_individual_audios") {
            const audioIds = JSON.parse(session.metadata.audioIds || "[]")
            const audioObjectIds = audioIds.map(id => new ObjectId(id))
            
            // Create payment record with all audio IDs
            await createPayment({
              userId: userObjectId,
              stripePaymentId: session.payment_intent,
              amount: session.amount_total / 100, // Convert from cents to dollars
              currency: session.currency,
              status: "succeeded",
              type: "one-time",
              metadata: session.metadata || {},
              audioId: audioObjectIds, // Save array of audio IDs
            })
            
            // Add all audio IDs to user's purchased audios
            await updateUser(userObjectId, {
              $addToSet: { purchasedAudios: { $each: audioObjectIds } },
            })
            
            console.log(`✅ Added ${audioIds.length} audios to user ${userObjectId} purchasedAudios array`)
          } else if (audioId) {
            // Handle single audio purchase
            await createPayment({
              userId: userObjectId,
              stripePaymentId: session.payment_intent,
              amount: session.amount_total / 100, // Convert from cents to dollars
              currency: session.currency,
              status: "succeeded",
              type: "one-time",
              metadata: session.metadata || {},
              audioId: new ObjectId(audioId), // Save single audio ID
            })
            
            await updateUser(userObjectId, {
              $addToSet: { purchasedAudios: new ObjectId(audioId) },
            })
            
            console.log(`✅ Added audio ${audioId} to user ${userObjectId} purchasedAudios array`)
          } else {
            // No audio purchase (shouldn't happen for payment mode, but just in case)
            await createPayment({
              userId: userObjectId,
              stripePaymentId: session.payment_intent,
              amount: session.amount_total / 100,
              currency: session.currency,
              status: "succeeded",
              type: "one-time",
              metadata: session.metadata || {},
              audioId: null,
            })
          }
        } 
        // else if (session.mode === "subscription") {
        //   // Handle subscription payment
        //   const subscription = await stripe.subscriptions.retrieve(session.subscription)

        //   await createSubscription({
        //     userId: userObjectId,
        //     stripeSubscriptionId: subscription.id,
        //     stripeCustomerId: subscription.customer,
        //     status: subscription.status,
        //     currentPeriodStart: new Date(subscription.current_period_start * 1000),
        //     currentPeriodEnd: new Date(subscription.current_period_end * 1000),
        //     cancelAtPeriodEnd: subscription.cancel_at_period_end,
        //     metadata: session.metadata || {},
        //   })

        //   // Update user's subscription status
        //   await updateUser(userObjectId, {
        //     hasActiveSubscription: true,
        //     stripeCustomerId: subscription.customer,
        //   })
        // }
        else if (session.mode === "subscription") {
          // Handle subscription payment
          const subscription = await stripe.subscriptions.retrieve(session.subscription)

          // Check if user already has an active subscription and cancel it
          const existingActiveSubscription = await findActiveSubscriptionByUserId(userObjectId);
          if (existingActiveSubscription) {
            try {
              // Cancel the existing subscription in Stripe
              await stripe.subscriptions.cancel(existingActiveSubscription.stripeSubscriptionId);
              
              // Update the subscription status in our database
              await updateSubscriptionByStripeId(existingActiveSubscription.stripeSubscriptionId, {
                status: "canceled",
                canceledAt: new Date(),
              });
            } catch (error) {
              console.error("Error canceling previous subscription:", error);
              // Continue with new subscription creation even if cancellation fails
            }
          }

          // Calculate period dates with fallback
          const currentPeriodStart = subscription.current_period_start
            ? new Date(subscription.current_period_start * 1000)
            : new Date(subscription.billing_cycle_anchor * 1000);

          const currentPeriodEnd = subscription.current_period_end
            ? new Date(subscription.current_period_end * 1000)
            : (() => {
                const end = new Date(subscription.billing_cycle_anchor * 1000);
                end.setMonth(end.getMonth() + 1);
                return end;
              })();

          await createSubscription({
            userId: userObjectId,
            stripeSubscriptionId: subscription.id,
            stripeCustomerId: subscription.customer,
            status: subscription.status,
            currentPeriodStart: currentPeriodStart,
            currentPeriodEnd: currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            metadata: session.metadata || {},
          })

          // Update user's subscription status
          await updateUser(userObjectId, {
            hasActiveSubscription: true,
            stripeCustomerId: subscription.customer,
            subscription: 'premium'
          })

          console.log(`✅ Subscription created for user ${userObjectId}`)
        }
        break
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object

        if (invoice.subscription) {
          // Find the user ID from the subscription
          const subscription = await findSubscriptionByStripeId(invoice.subscription)
          
          if (subscription) {
            // Record the payment for the subscription
            await createPayment({
              userId: subscription.userId,
              stripePaymentId: invoice.payment_intent,
              amount: invoice.amount_paid / 100,
              currency: invoice.currency,
              status: "succeeded",
              type: "subscription",
              metadata: invoice.metadata || {},
            })

            // Fetch the latest subscription data from Stripe to get updated period dates
            const stripeSubscription = await stripe.subscriptions.retrieve(invoice.subscription)

            // Update subscription period dates in database
            if (stripeSubscription.current_period_start && stripeSubscription.current_period_end) {
              await updateSubscriptionByStripeId(invoice.subscription, {
                status: stripeSubscription.status,
                currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
                currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
                cancelAtPeriodEnd: stripeSubscription.cancel_at_period_end,
              })
            }

            // Ensure user has active subscription status after successful payment
            await updateUser(subscription.userId, {
              hasActiveSubscription: true,
              subscription: 'premium'
            })

            console.log(`✅ Subscription payment succeeded for user ${subscription.userId}`)
          }
        }
        break
      }

      // case "customer.subscription.updated": {
      //   const subscription = event.data.object

      //   await updateSubscriptionByStripeId(subscription.id, {
      //     status: subscription.status,
      //     currentPeriodStart: new Date(subscription.current_period_start * 1000),
      //     currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      //     cancelAtPeriodEnd: subscription.cancel_at_period_end,
      //     ...(subscription.canceled_at && { canceledAt: new Date(subscription.canceled_at * 1000) }),
      //   })
      //   break
      //       }

      case "customer.subscription.created": {
        const subscription = event.data.object

        // This event is triggered when a subscription is created or renewed
        const existingSubscription = await findSubscriptionByStripeId(subscription.id)
        
        if (existingSubscription) {
          // Update subscription period dates
          if (subscription.current_period_start && subscription.current_period_end) {
            await updateSubscriptionByStripeId(subscription.id, {
              status: subscription.status,
              currentPeriodStart: new Date(subscription.current_period_start * 1000),
              currentPeriodEnd: new Date(subscription.current_period_end * 1000),
              cancelAtPeriodEnd: subscription.cancel_at_period_end,
            })
          }

          await updateUser(existingSubscription.userId, {
            hasActiveSubscription: true,
            subscription: 'premium'
          })
          
          console.log(`✅ Subscription renewed for user ${existingSubscription.userId}`)
        }
        break
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object;

        try {
          let currentPeriodStart, currentPeriodEnd;

          // Try to get period dates from top-level subscription object
          if (subscription.current_period_start && subscription.current_period_end) {
            currentPeriodStart = new Date(subscription.current_period_start * 1000);
            currentPeriodEnd = new Date(subscription.current_period_end * 1000);
          } 
          // Try to get from subscription items (fallback for some webhook events)
          else if (subscription.items?.data?.[0]?.current_period_start && subscription.items?.data?.[0]?.current_period_end) {
            currentPeriodStart = new Date(subscription.items.data[0].current_period_start * 1000);
            currentPeriodEnd = new Date(subscription.items.data[0].current_period_end * 1000);
          }
          // If still not available, fetch from Stripe API
          else {
            const stripeSubscription = await stripe.subscriptions.retrieve(subscription.id);
            
            if (stripeSubscription.current_period_start && stripeSubscription.current_period_end) {
              currentPeriodStart = new Date(stripeSubscription.current_period_start * 1000);
              currentPeriodEnd = new Date(stripeSubscription.current_period_end * 1000);
            } else {
              // Fallback to billing cycle anchor
              console.error("WARNING: Could not find period dates, using billing_cycle_anchor as fallback");
              currentPeriodStart = new Date(subscription.billing_cycle_anchor * 1000);
              currentPeriodEnd = new Date(subscription.billing_cycle_anchor * 1000);
              currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
            }
          }

          await updateSubscriptionByStripeId(subscription.id, {
            status: subscription.status,
            currentPeriodStart: currentPeriodStart,
            currentPeriodEnd: currentPeriodEnd,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            ...(subscription.canceled_at && { 
              canceledAt: new Date(subscription.canceled_at * 1000) 
            }),
          });

          console.log(`✅ Updated subscription ${subscription.id}`);
        } catch (error) {
          console.error("Error processing subscription update:", error);
        }
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object

        const existingSubscription = await findSubscriptionByStripeId(subscription.id)
        
        if (existingSubscription) {
          await updateSubscriptionByStripeId(subscription.id, {
            status: "canceled",
            canceledAt: new Date(),
          })

          // Update user's subscription status
          await updateUser(existingSubscription.userId, {
            hasActiveSubscription: false,
            subscription: 'free'
          })
        }
        break
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object

        if (invoice.subscription) {
          const subscription = await findSubscriptionByStripeId(invoice.subscription)
          
          if (subscription) {
            // Update subscription status to past_due
            await updateSubscriptionByStripeId(invoice.subscription, {
              status: "past_due"
            })

            // Update user's subscription status to inactive
            await updateUser(subscription.userId, {
              hasActiveSubscription: false,
              subscription: 'free'
            })

            console.log(`❌ Payment failed for subscription ${invoice.subscription}`)
          }
        }
        break
      }

      case "customer.subscription.paused": {
        const subscription = event.data.object

        const existingSubscription = await findSubscriptionByStripeId(subscription.id)
        
        if (existingSubscription) {
          await updateSubscriptionByStripeId(subscription.id, {
            status: "paused"
          })

          // Update user's subscription status to inactive
          await updateUser(existingSubscription.userId, {
            hasActiveSubscription: false,
            subscription: 'free'
          })
          
          console.log(`⏸️ Subscription paused for user ${existingSubscription.userId}`)
        }
        break
      }

      case "customer.subscription.resumed": {
        const subscription = event.data.object

        const existingSubscription = await findSubscriptionByStripeId(subscription.id)
        
        if (existingSubscription) {
          await updateSubscriptionByStripeId(subscription.id, {
            status: "active"
          })

          // Update user's subscription status to active
          await updateUser(existingSubscription.userId, {
            hasActiveSubscription: true,
            subscription: 'premium'
          })
          
          console.log(`▶️ Subscription resumed for user ${existingSubscription.userId}`)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 })
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
}