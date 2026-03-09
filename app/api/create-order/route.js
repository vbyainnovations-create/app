import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const getRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_KEY_ID?.trim();
  const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();

  if (!keyId || !keySecret) {
    return null;
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
};

export async function POST(request) {
  try {
    const payload = await request.json();
    const amountInRupees = Number(payload?.amount || 0);

    if (!amountInRupees || amountInRupees <= 0) {
      return NextResponse.json(
        { message: "Invalid amount for order creation." },
        { status: 400 }
      );
    }

    const client = getRazorpayClient();

    if (!client) {
      return NextResponse.json(
        { message: "Razorpay environment variables are missing." },
        { status: 500 }
      );
    }

    const amount = Math.round(amountInRupees * 100);
    const receipt = `mentora_${Date.now()}_${Math.floor(Math.random() * 1000)}`.slice(
      0,
      40
    );

    const order = await client.orders.create({
      amount,
      currency: "INR",
      receipt,
    });

    return NextResponse.json(
      {
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to create Razorpay order.",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
