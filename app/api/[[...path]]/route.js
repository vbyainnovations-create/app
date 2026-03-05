import { NextResponse } from "next/server";

const noApiNeededResponse = () => {
  return NextResponse.json(
    {
      message:
        "No backend API is required for the current Mentora Edutors homepage build.",
    },
    { status: 404 }
  );
};

const getPathSegments = (params) => {
  return params?.path || [];
};

export async function GET() {
  return noApiNeededResponse();
}

export async function POST(request, { params }) {
  const pathSegments = getPathSegments(params);

  if (pathSegments.length === 1 && pathSegments[0] === "intro-requests") {
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
      const parentName = payload?.parent_name?.trim?.() || "";
      const phone = payload?.phone?.trim?.() || "";
      const classLevel = payload?.class_level?.trim?.() || "";
      const subject = payload?.subject?.trim?.() || "";
      const topicCluster = payload?.topic_cluster?.trim?.() || "";
      const area = payload?.area?.trim?.() || "";

      if (
        !parentName ||
        !phone ||
        !classLevel ||
        !subject ||
        !topicCluster ||
        !area
      ) {
        return NextResponse.json(
          { message: "Missing required fields." },
          { status: 400 }
        );
      }

      const supabaseResponse = await fetch(
        `${supabaseUrl}/rest/v1/intro_requests`,
        {
          method: "POST",
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            parent_name: parentName,
            phone,
            class_level: classLevel,
            subject,
            topic_cluster: topicCluster,
            area,
          }),
        }
      );

      if (!supabaseResponse.ok) {
        const errorText = await supabaseResponse.text();

        return NextResponse.json(
          {
            message: "Failed to store intro request.",
            details: errorText || "Unknown Supabase error.",
          },
          { status: 502 }
        );
      }

      return NextResponse.json(
        { message: "Intro request stored successfully." },
        { status: 201 }
      );
    } catch (error) {
      return NextResponse.json(
        {
          message: "Unexpected error while storing intro request.",
          details: error?.message || "Unknown error",
        },
        { status: 500 }
      );
    }
  }

  return noApiNeededResponse();
}

export async function PUT() {
  return noApiNeededResponse();
}

export async function PATCH() {
  return noApiNeededResponse();
}

export async function DELETE() {
  return noApiNeededResponse();
}
