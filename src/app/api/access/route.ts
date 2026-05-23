import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const code = body.code as string | undefined;

    const correctCode = process.env.ECHO_ACCESS_CODE;

    if (!correctCode) {
      return NextResponse.json(
        { error: "Missing ECHO_ACCESS_CODE on server." },
        { status: 500 }
      );
    }

    if (!code || code.trim() !== correctCode) {
      return NextResponse.json(
        { error: "არასწორი access code." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({ ok: true });

    response.cookies.set("echo_access", "granted", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch {
    return NextResponse.json(
      { error: "Access check failed." },
      { status: 500 }
    );
  }
}