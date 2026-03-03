import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.redirect(
    new URL("/de/admin/login", process.env.APP_URL ?? "http://localhost:3000")
  );
  response.cookies.set("icf_admin_token", "", {
    httpOnly: true,
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
  return response;
}
