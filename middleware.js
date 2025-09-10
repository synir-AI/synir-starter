import { NextResponse } from "next/server";

export function middleware(req) {
  const res = NextResponse.next();
  // Assign a stable, opaque uid if missing (used for rate limiting when not logged in)
  const uid = req.cookies.get("uid")?.value;
  if (!uid) {
    const rnd = crypto.randomUUID();
    res.cookies.set("uid", rnd, { path: "/", httpOnly: true, sameSite: "lax", secure: true, maxAge: 60 * 60 * 24 * 365 });
  }
  return res;
}

