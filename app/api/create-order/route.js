import { NextResponse } from "next/server";
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function POST(request) {
  try {
    const payload = await request.json();
    const amount = Number(payload?.amount || 0);

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { message: "Invalid amount." },
        { status: 400 }
      );
    }

    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json(
        { message: "Razorpay credentials are missing." },
        { status: 500 }
      );
    }

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `mentora_${Date.now()}`,
    });

    return NextResponse.json({ order_id: order.id }, { status: 200 });
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
