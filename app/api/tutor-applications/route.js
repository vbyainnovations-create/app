import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { message: "Supabase environment variables are missing." },
        { status: 500 }
      );
    }

    const payload = await request.json();

    const requiredFields = [
      "full_name",
      "mobile_number",
      "email_address",
      "city",
      "area_locality",
      "subjects_taught",
      "classes_taught",
      "mode_of_teaching",
      "years_of_experience",
      "expected_hourly_fees",
      "current_address",
      "pincode",
      "aadhaar_front_path",
      "aadhaar_back_path",
      "pan_card_path",
      "live_selfie_path",
    ];

    const missingField = requiredFields.find((field) => {
      const value = payload?.[field];

      if (Array.isArray(value)) {
        return value.length === 0;
      }

      return value === undefined || value === null || String(value).trim() === "";
    });

    if (missingField) {
      return NextResponse.json(
        { message: `Missing required field: ${missingField}` },
        { status: 400 }
      );
    }

    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/tutor_applications`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({
        ...payload,
        application_status: "Submitted",
      }),
    });

    if (!insertResponse.ok) {
      const errorText = await insertResponse.text();

      return NextResponse.json(
        {
          message: "Failed to submit tutor application.",
          details: errorText || "Unknown database error",
        },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { message: "Tutor application submitted successfully." },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        message: "Failed to submit tutor application.",
        details: error?.message || "Unknown error",
      },
      { status: 500 }
    );
  }
}
