export const runtime = "nodejs";

export async function POST(req) {
  try {
    const { searchParams } = new URL(req.url);
    const on = searchParams.get("on") === "1";
    const headers = new Headers({ "Content-Type": "application/json" });
    if (on) {
      headers.append("Set-Cookie", `pro=1; Path=/; SameSite=Lax; Max-Age=${60*60*24*7}`);
    } else {
      headers.append("Set-Cookie", "pro=; Path=/; Max-Age=0; SameSite=Lax");
    }
    return new Response(JSON.stringify({ ok: true, pro: on }), { status: 200, headers });
  } catch (e) {
    return new Response(`Server error: ${e.message}`, { status: 500 });
  }
}

