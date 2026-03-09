import { createHmac } from "node:crypto";
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

const getRazorpayConfig = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return null;
  }

  return { keyId: keyId.trim(), keySecret: keySecret.trim() };
};

const insertPaymentRecord = async ({
  supabaseUrl,
  serviceRoleKey,
  parentName,
  phone,
  amount,
  paymentStatus,
  paymentId,
}) => {
  const response = await fetch(`${supabaseUrl}/rest/v1/payments`, {
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
      amount,
      payment_status: paymentStatus,
      payment_id: paymentId || null,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to store payment record.");
  }
};

const verifyRazorpaySignature = ({
  orderId,
  paymentId,
  signature,
  keySecret,
}) => {
  const generatedSignature = createHmac("sha256", keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return generatedSignature === signature;
};

};

const statusOptions = [
  "New",
  "Contacted",
  "Tutor Assigned",
  "Completed",
  "Closed",
];

const tutorOptions = [
  "Aman Sharma",
  "Ishita Mehta",
  "Rahul Verma",
  "Veena Gupta",
];

const incrementSessionsCompletedForParent = async ({
  supabaseUrl,
  serviceRoleKey,
  parentName,
}) => {
  const query = new URLSearchParams({
    select: "id,sessions_completed",
    parent_name: `eq.${parentName}`,
  });

  const fetchRowsResponse = await fetch(
    `${supabaseUrl}/rest/v1/intro_requests?${query.toString()}`,
    {
      method: "GET",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
      },
      cache: "no-store",
    }
  );

  if (!fetchRowsResponse.ok) {
    const errorText = await fetchRowsResponse.text();
    throw new Error(errorText || "Failed to fetch intro requests for increment.");
  }

  const introRequests = await fetchRowsResponse.json();

  if (!Array.isArray(introRequests) || introRequests.length === 0) {
    return 0;
  }

  for (const introRequest of introRequests) {
    const nextCount = Number(introRequest?.sessions_completed || 0) + 1;
    const idValue = String(introRequest?.id || "");

    if (!idValue) {
      continue;
    }

    const updateResponse = await fetch(
      `${supabaseUrl}/rest/v1/intro_requests?id=eq.${encodeURIComponent(idValue)}`,
      {
        method: "PATCH",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
          Prefer: "return=minimal",
        },
        body: JSON.stringify({ sessions_completed: nextCount }),
      }
    );

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      throw new Error(errorText || "Failed to increment sessions_completed.");
    }
  }

  return introRequests.length;
};

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
        `${supabaseUrl}/rest/v1/intro_requests?select=id,parent_name,phone,class_level,subject,topic_cluster,area,assigned_tutor,created_at,status&order=created_at.desc`,
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

  if (
    pathSegments.length === 2 &&
    pathSegments[0] === "payments" &&
    pathSegments[1] === "create-order"
  ) {
    try {
      const razorpayConfig = getRazorpayConfig();

      if (!razorpayConfig) {
        return NextResponse.json(
          { message: "Razorpay environment variables are missing." },
          { status: 500 }
        );
      }

      const payload = await request.json();
      const parentName = payload?.parent_name?.trim?.() || "";
      const phone = payload?.phone?.trim?.() || "";
      const amountInRupees = Number(payload?.amount || 0);

      if (!parentName || !phone || !amountInRupees || amountInRupees <= 0) {
        return NextResponse.json(
          { message: "Missing required fields." },
          { status: 400 }
        );
      }

      const amountInPaise = Math.round(amountInRupees * 100);
      const { keyId, keySecret } = razorpayConfig;
      const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

      const orderResponse = await fetch("https://api.razorpay.com/v1/orders", {
        method: "POST",
        headers: {
          Authorization: `Basic ${authHeader}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: amountInPaise,
          currency: "INR",
          receipt: `mentora_${Date.now()}`.slice(0, 40),
          payment_capture: 1,
        }),
      });

      const orderPayload = await orderResponse.json();

      if (!orderResponse.ok) {
        return NextResponse.json(
          {
            message: "Failed to create Razorpay order.",
            details: orderPayload?.error?.description || "Unknown Razorpay error.",
          },
          { status: 502 }
        );
      }

      return NextResponse.json(
        {
          key_id: keyId,
          order_id: orderPayload?.id,
          amount: orderPayload?.amount,
          currency: orderPayload?.currency || "INR",
        },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json(
        {
          message: "Unexpected error while creating payment order.",
          details: error?.message || "Unknown error",
        },
        { status: 500 }
      );
    }
  }

  if (
    pathSegments.length === 2 &&
    pathSegments[0] === "payments" &&
    pathSegments[1] === "verify"
  ) {
    try {
      const config = getSupabaseConfig();
      const razorpayConfig = getRazorpayConfig();

      if (!config || !razorpayConfig) {
        return NextResponse.json(
          { message: "Payment environment variables are missing." },
          { status: 500 }
        );
      }

      const { supabaseUrl, serviceRoleKey } = config;
      const { keySecret } = razorpayConfig;

      const payload = await request.json();
      const parentName = payload?.parent_name?.trim?.() || "";
      const phone = payload?.phone?.trim?.() || "";
      const amount = Number(payload?.amount || 0);
      const orderId = payload?.razorpay_order_id?.trim?.() || "";
      const paymentId = payload?.razorpay_payment_id?.trim?.() || "";
      const signature = payload?.razorpay_signature?.trim?.() || "";

      if (!parentName || !phone || !amount || !orderId || !paymentId || !signature) {
        return NextResponse.json(
          { message: "Missing required fields." },
          { status: 400 }
        );
      }

      const isSignatureValid = verifyRazorpaySignature({
        orderId,
        paymentId,
        signature,
        keySecret,
      });

      if (!isSignatureValid) {
        await insertPaymentRecord({
          supabaseUrl,
          serviceRoleKey,
          parentName,
          phone,
          amount,
          paymentStatus: "Failed",
          paymentId,
        });

        return NextResponse.json(
          { message: "Invalid payment signature." },
          { status: 400 }
        );
      }

      await insertPaymentRecord({
        supabaseUrl,
        serviceRoleKey,
        parentName,
        phone,
        amount,
        paymentStatus: "Paid",
        paymentId,
      });

      return NextResponse.json(
        { message: "Payment verified and stored successfully." },
        { status: 200 }
      );
    } catch (error) {
      return NextResponse.json(
        {
          message: "Unexpected error while verifying payment.",
          details: error?.message || "Unknown error",
        },
        { status: 500 }
      );
    }
  }

  if (
    pathSegments.length === 2 &&
    pathSegments[0] === "payments" &&
    pathSegments[1] === "failed"
  ) {
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
      const amount = Number(payload?.amount || 0);
      const paymentId = payload?.payment_id?.trim?.() || "";

      if (!parentName || !phone || !amount) {
        return NextResponse.json(
          { message: "Missing required fields." },
          { status: 400 }
        );
      }

      await insertPaymentRecord({
        supabaseUrl,
        serviceRoleKey,
        parentName,
        phone,
        amount,
        paymentStatus: "Failed",
        paymentId,
      });

      return NextResponse.json(
        { message: "Failed payment stored." },
        { status: 201 }
      );
    } catch (error) {
      return NextResponse.json(
        {
          message: "Unexpected error while storing failed payment.",
          details: error?.message || "Unknown error",
        },
        { status: 500 }
      );
    }
  }

  if (pathSegments.length === 1 && pathSegments[0] === "session-reports") {
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
      const tutorName = payload?.tutor_name?.trim?.() || "";
      const parentName = payload?.parent_name?.trim?.() || "";
      const subject = payload?.subject?.trim?.() || "";
      const topicCluster = payload?.topic_cluster?.trim?.() || "";
      const sessionNotes = payload?.session_notes?.trim?.() || "";
      const homework = payload?.homework?.trim?.() || "";
      const sessionDate = payload?.session_date || "";

      if (
        !tutorName ||
        !parentName ||
        !subject ||
        !topicCluster ||
        !sessionNotes ||
        !homework ||
        !sessionDate
      ) {
        return NextResponse.json(
          { message: "Missing required fields." },
          { status: 400 }
        );
      }

      const supabaseResponse = await fetch(
        `${supabaseUrl}/rest/v1/session_reports`,
        {
          method: "POST",
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
            "Content-Type": "application/json",
            Prefer: "return=minimal",
          },
          body: JSON.stringify({
            tutor_name: tutorName,
            parent_name: parentName,
            subject,
            topic_cluster: topicCluster,
            session_notes: sessionNotes,
            homework,
            session_date: sessionDate,
          }),
        }
      );

      if (!supabaseResponse.ok) {
        const errorText = await supabaseResponse.text();

        return NextResponse.json(
          {
            message: "Failed to store session report.",
            details: errorText || "Unknown Supabase error.",
          },
          { status: 502 }
        );
      }

      await incrementSessionsCompletedForParent({
        supabaseUrl,
        serviceRoleKey,
        parentName,
      });

      return NextResponse.json(
        { message: "Session report submitted successfully." },
        { status: 201 }
      );
    } catch (error) {
      return NextResponse.json(
        {
          message: "Unexpected error while storing session report.",
          details: error?.message || "Unknown error",
        },
        { status: 500 }
      );
    }
  }

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
      const assignedTutorRaw = payload?.assigned_tutor;
      const assignedTutor =
        typeof assignedTutorRaw === "string" ? assignedTutorRaw.trim() : "";

      if (!id) {
        return NextResponse.json(
          { message: "Missing required fields." },
          { status: 400 }
        );
      }

      const updatePayload = {};

      if (status) {
        if (!statusOptions.includes(status)) {
          return NextResponse.json(
            { message: "Invalid status value." },
            { status: 400 }
          );
        }

        updatePayload.status = status;
      }

      if (Object.prototype.hasOwnProperty.call(payload, "assigned_tutor")) {
        if (assignedTutor && !tutorOptions.includes(assignedTutor)) {
          return NextResponse.json(
            { message: "Invalid tutor value." },
            { status: 400 }
          );
        }

        updatePayload.assigned_tutor = assignedTutor || null;
      }

      if (!Object.keys(updatePayload).length) {
        return NextResponse.json(
          { message: "No valid update fields provided." },
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
          body: JSON.stringify(updatePayload),
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
