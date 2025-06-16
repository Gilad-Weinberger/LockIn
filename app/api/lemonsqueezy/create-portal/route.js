import { NextResponse } from "next/server";
import { createCustomerPortal } from "@/lib/lemonsqueezy";
import { getUserData } from "@/lib/functions/userFunctions";

export async function POST(req) {
  try {
    // Get the user ID from request body
    const body = await req.json();
    const userId = body.userId;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const user = await getUserData(userId);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user?.lemonsqueezyCustomerId) {
      return NextResponse.json(
        {
          error: "You don't have a billing account yet. Make a purchase first.",
        },
        { status: 400 }
      );
    }

    const url = await createCustomerPortal({
      customerId: user.lemonsqueezyCustomerId,
    });

    return NextResponse.json({
      url,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
