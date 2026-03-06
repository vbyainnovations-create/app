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

const getSupabaseConfig = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return { supabaseUrl, serviceRoleKey };
};

const statusOptions = [
  "New",
  "Contacted",
  "Tutor Assigned",
  "Completed",
  "Closed",
];

export async function GET(request, { params }) {
  const pathSegments = getPathSegments(params);

  if (pathSegments.length === 1 && pathSegments[0] === "intro-requests") {
    try {
      const config = getSupabaseConfig();

      if (!config) {
        return NextResponse.json(
          { message: "Supabase environment variables are missing." },
          { status: 500 }
        );
      }

      const { supabaseUrl, serviceRoleKey } = config;
      const response = await fetch(
        `${supabaseUrl}/rest/v1/intro_requests?select=id,parent_name,phone,class_level,subject,topic_cluster,area,created_at,status&order=created_at.desc`,
        {
          method: "GET",
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
          cache: "no-store",
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        return NextResponse.json(
          {
            message: "Failed to fetch intro requests.",
            details: errorText || "Unknown Supabase error.",
          },
          { status: 502 }
        );
      }

      const data = await response.json();

      return NextResponse.json(
        { requests: Array.isArray(data) ? data : [] },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json(
        {
          message: "Unexpected error while fetching intro requests.",
          details: error?.message || "Unknown error",
        },
        { status: 500 }
      );
    }
  }

  return noApiNeededResponse();
}

export async function POST(request, { params }) {
  const pathSegments = getPathSegments(params);

  if (pathSegments.length === 1 && pathSegments[0] === "intro-requests") {
    try {
      const config = getSupabaseConfig();

      if (!config) {
        return NextResponse.json(
          { message: "Supabase environment variables are missing." },
          { status: 500 }
        );
      }

      const { supabaseUrl, serviceRoleKey } = config;
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
            status: "New",
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

export async function PATCH(request, { params }) {
  const pathSegments = getPathSegments(params);

  if (pathSegments.length === 1 && pathSegments[0] === "intro-requests") {
    try {
      const config = getSupabaseConfig();

      if (!config) {
        return NextResponse.json(
          { message: "Supabase environment variables are missing." },
          { status: 500 }
        );
      }

      const { supabaseUrl, serviceRoleKey } = config;
      const payload = await request.json();
      const id = payload?.id;
      const status = payload?.status?.trim?.() || "";

      if (!id || !status) {
        return NextResponse.json(
          { message: "Missing required fields." },
          { status: 400 }
        );
      }

      if (!statusOptions.includes(status)) {
        return NextResponse.json(
          { message: "Invalid status value." },
          { status: 400 }
        );
      }

      const idValue = String(id);
      const supabaseResponse = await fetch(
        `${supabaseUrl}/rest/v1/intro_requests?id=eq.${encodeURIComponent(idValue)}`,
        {
          method: "PATCH",
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            "Content-Type": "application/json",
            Prefer: "return=representation",
          },
          body: JSON.stringify({ status }),
        }
      );

      if (!supabaseResponse.ok) {
        const errorText = await supabaseResponse.text();

        return NextResponse.json(
          {
            message: "Failed to update intro request status.",
            details: errorText || "Unknown Supabase error.",
          },
          { status: 502 }
        );
      }

      const updatedRows = await supabaseResponse.json();
      const updated = Array.isArray(updatedRows) ? updatedRows[0] : null;

      return NextResponse.json(
        {
          message: "Status updated successfully.",
          request: updated,
        },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json(
        {
          message: "Unexpected error while updating request status.",
          details: error?.message || "Unknown error",
        },
        { status: 500 }
      );
    }
  }

  return noApiNeededResponse();
}

export async function DELETE() {
  return noApiNeededResponse();
}
