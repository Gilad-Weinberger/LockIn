import { NextResponse } from "next/server";
import { headers } from "next/headers";
import crypto from "crypto";
import config from "@/lib/config";
import {
  updateUserPaymentInfo,
  getUserData,
  findUserByCustomerId,
} from "@/lib/functions/userFunctions";

// This is where we receive LemonSqueezy webhook events
// It used to update the user data, send emails, etc...
export async function POST(req) {
  const secret = process.env.LEMONSQUEEZY_SIGNING_SECRET;
  if (!secret) {
    return new Response("LEMONSQUEEZY_SIGNING_SECRET is required.", {
      status: 400,
    });
  }

  // Verify the signature
  const text = await req.text();

  const hmac = crypto.createHmac("sha256", secret);
  const digest = Buffer.from(hmac.update(text).digest("hex"), "utf8");
  const signature = Buffer.from(headers().get("x-signature"), "utf8");

  if (!crypto.timingSafeEqual(digest, signature)) {
    return new Response("Invalid signature.", {
      status: 400,
    });
  }

  // Get the payload
  const payload = JSON.parse(text);

  const eventName = payload.meta.event_name;
  const customerId = payload.data.attributes.customer_id.toString();

  try {
    switch (eventName) {
      case "subscription_created": {
        // ✅ Grant access to the subscription
        const userId = payload.meta?.custom_data?.user_id;
        const variantId = payload.data.attributes.variant_id.toString();

        const plan = config.lemonsqueezy.plans.find(
          (p) => p.variantId === variantId
        );
        if (!plan) {
          console.error("Plan not found for variantId:", variantId);
          // Don't throw error, just log it and continue
        }

        let userDocData;

        // Get or create the user. userId is normally passed in the checkout session (custom_data) to identify the user when we get the webhook event
        if (userId) {
          userDocData = await getUserData(userId);
          if (!userDocData) {
            throw new Error("User not found with ID:", userId);
          }
        } else {
          throw new Error("No user identification provided");
        }

        // Update user payment info using the dedicated function
        if (userDocData?.id) {
          await updateUserPaymentInfo(
            userDocData.id,
            customerId,
            variantId,
            true
          );
          console.log(
            `Granted subscription access for user ${userDocData.id}: customerId=${customerId}, variantId=${variantId}`
          );
        } else {
          console.error("User ID not found in user document");
        }

        // Log the user who just paid for easier debugging
        console.log(
          "[LemonSqueezy] subscription_created webhook – userId:",
          userId,
          "customerId:",
          customerId,
          "variantId:",
          variantId
        );

        break;
      }

      case "subscription_updated": {
        // Handle subscription updates (plan changes, etc.)
        const variantId = payload.data.attributes.variant_id.toString();

        const plan = config.lemonsqueezy.plans.find(
          (p) => p.variantId === variantId
        );
        if (!plan) {
          console.error("Plan not found for variantId:", variantId);
          // Don't throw error, just log it and continue
        }

        // Find user by lemonsqueezyCustomerId
        const userDocData = await findUserByCustomerId(customerId);

        if (userDocData) {
          // Update user payment info with new variant
          await updateUserPaymentInfo(
            userDocData.id,
            customerId,
            variantId,
            true // Keep access active since it's an update
          );

          console.log(
            `Updated subscription for user ${userDocData.id}: customerId=${customerId}, new variantId=${variantId}`
          );
        } else {
          console.error("No user found with customerId:", customerId);
        }

        break;
      }

      case "subscription_cancelled": {
        // Find user by lemonsqueezyCustomerId
        const userDocData = await findUserByCustomerId(customerId);

        if (userDocData) {
          // Update user access status using the dedicated function
          await updateUserPaymentInfo(
            userDocData.id,
            customerId,
            userDocData.lemonsqueezyVariantId,
            false
          );

          console.log(
            `Revoked access for user ${userDocData.id}: customerId=${customerId}`
          );
        } else {
          console.error("No user found with customerId:", customerId);
        }

        break;
      }

      default:
    }
  } catch (e) {
    console.error("lemonsqueezy error: ", e.message);
  }

  return NextResponse.json({});
}
