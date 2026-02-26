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

export async function GET() {
  return noApiNeededResponse();
}

export async function POST() {
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
