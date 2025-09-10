export const runtime = "nodejs";

// Basic in-memory rate limiter (best-effort; resets on cold start)
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 10; // max requests per window per IP
const hits = new Map(); // key -> { count, reset }

function parseIp(req) {
  const xf = req.headers.get("x-forwarded-for") || "";
  const ip = xf.split(",")[0].trim();
  return ip || "unknown";
}

function limited(ip) {
  const now = Date.now();
  const rec = hits.get(ip) || { count: 0, reset: now + RATE_LIMIT_WINDOW_MS };
  if (now > rec.reset) {
    rec.count = 0;
    rec.reset = now + RATE_LIMIT_WINDOW_MS;
  }
  rec.count += 1;
  hits.set(ip, rec);
  return rec.count > RATE_LIMIT_MAX;
}

function validEmail(s) {
  const v = String(s || "").trim();
  if (!v || v.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
}

export async function POST(req) {
  try {
    // Require same-origin (or explicit allow) and XRW header
    const origin = req.headers.get("origin") || "";
    const host = req.headers.get("host") || "";
    const allowed = process.env.ALLOWED_ORIGIN || "";
    const xrw = req.headers.get("x-requested-with");
    if (xrw !== "XMLHttpRequest") return new Response("Bad request", { status: 400 });
    if (origin && allowed) {
      if (origin !== allowed) return new Response("Forbidden origin", { status: 403 });
    } else if (origin) {
      const originHost = (() => { try { return new URL(origin).host; } catch { return ""; } })();
      if (originHost && originHost !== host) return new Response("Forbidden origin", { status: 403 });
    }

    // Rate limit
    const ip = parseIp(req);
    if (limited(ip)) return new Response("Too Many Requests", { status: 429 });

    // Body + honeypot
    const body = await req.json().catch(() => null);
    if (!body) return new Response("Invalid JSON", { status: 400 });
    const { name = "", email = "", message = "", website = "" } = body;
    if (website && website.trim()) return new Response(null, { status: 204 }); // honeypot
    const nameT = String(name).trim();
    const emailT = String(email).trim();
    const msgT = String(message).trim();
    if (!nameT || !emailT || !msgT) return new Response("Missing fields", { status: 400 });
    if (!validEmail(emailT)) return new Response("Invalid email", { status: 400 });
    if (nameT.length > 200 || msgT.length > 4000) return new Response("Payload too large", { status: 413 });

    // Turnstile verify (optional)
    const turnstileSecret = process.env.TURNSTILE_SECRET_KEY;
    const token = req.headers.get("cf-turnstile-response") || body["cf-turnstile-response"] || "";
    if (turnstileSecret) {
      const form = new URLSearchParams();
      form.append("secret", turnstileSecret);
      form.append("response", token);
      if (ip) form.append("remoteip", ip);
      const tv = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body: form });
      const tvj = await tv.json().catch(() => ({}));
      if (!tvj.success) return new Response("Captcha failed", { status: 400 });
    }

    const to = process.env.CONTACT_TO || "owner@example.com"; // set CONTACT_TO in env
    const from = process.env.CONTACT_FROM || "noreply@synir.ai";

    const apiKey = process.env.RESEND_API_KEY;
    if (apiKey) {
      // Send via Resend API (simple text email)
      const payload = {
        from,
        to,
        subject: `New contact form submission from ${nameT}`,
        text: `From: ${nameT} <${emailT}>\nIP: ${ip}\n\n${msgT}`,
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
    console.log("Contact message received:", { name: nameT, email: emailT, message: msgT, ip });
    return Response.json({ ok: true, note: "Email not sent (RESEND_API_KEY missing)." });
  } catch (e) {
    return new Response(`Server error: ${e.message}`, { status: 500 });
  }
}
