export const runtime = "nodejs";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return new Response("Invalid JSON", { status: 400 });
    const { name = "", email = "", message = "" } = body;
    if (!name.trim() || !email.trim() || !message.trim()) {
      return new Response("Missing fields", { status: 400 });
    }

    const to = process.env.CONTACT_TO || "owner@example.com"; // set CONTACT_TO in env
    const from = process.env.CONTACT_FROM || "noreply@synir.ai";

    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      // Send via Resend API (simple text email)
      const payload = {
        from,
        to,
        subject: `New contact form submission from ${name}`,
        text: `From: ${name} <${email}>\n\n${message}`,
      };
      const r = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!r.ok) {
        const t = await r.text().catch(() => "");
        return new Response(`Email send failed: ${t}`, { status: 502 });
      }
      return Response.json({ ok: true });
    }

    // Fallback: accept without sending (useful in dev)
    console.log("Contact message received:", { name, email, message });
    return Response.json({ ok: true, note: "Email not sent (RESEND_API_KEY missing)." });
  } catch (e) {
    return new Response(`Server error: ${e.message}`, { status: 500 });
  }
}

