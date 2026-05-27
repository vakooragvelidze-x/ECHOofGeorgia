import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const code = typeof body.code === "string" ? body.code.trim() : "";

    const accessCode = process.env.ACCESS_CODE;

    if (!accessCode) {
      return NextResponse.json(
        { error: "Missing ACCESS_CODE in .env.local." },
        { status: 500 }
      );
    }

    if (code !== accessCode) {
      return NextResponse.json(
        { error: "Incorrect access code." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ success: true });

    response.cookies.set("echo_access", "granted", {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Invalid request." },
      { status: 400 }
    );
  }
}