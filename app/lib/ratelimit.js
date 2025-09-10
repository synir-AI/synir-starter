// Lightweight Upstash REST rate limiter
// Env: UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN

async function upstash(command, args = []) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return { ok: false, error: "Upstash not configured" };
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ command: [command, ...args] }),
    cache: "no-store",
  });
  if (!res.ok) return { ok: false, error: await res.text().catch(() => "") };
  const data = await res.json().catch(() => ({}));
  return { ok: true, data };
}

export async function limit(key, { max = 10, windowSec = 60 } = {}) {
  // increments the key and sets TTL on first hit
  const inc = await upstash("INCR", [key]);
  if (!inc.ok) return { allowed: true, remaining: max, reset: Date.now() + windowSec * 1000, note: inc.error };
  const count = typeof inc.data?.result === "number" ? inc.data.result : parseInt(inc.data?.result || "0", 10);
  if (count === 1) {
    await upstash("EXPIRE", [key, String(windowSec)]);
  }
  const ttlRes = await upstash("TTL", [key]);
  const ttl = typeof ttlRes.data?.result === "number" ? ttlRes.data.result : 0;
  const reset = Date.now() + Math.max(0, ttl) * 1000;
  return { allowed: count <= max, remaining: Math.max(0, max - count), reset };
}

export function quotaKey({ tool = "generic", uid = "anon", period = "1d" }) {
  // period: 1d or 1h – embed date to bucket by day
  const now = new Date();
  const bucket = period === "1h"
    ? `${now.getUTCFullYear()}${String(now.getUTCMonth()+1).padStart(2,"0")}${String(now.getUTCDate()).padStart(2,"0")}${String(now.getUTCHours()).padStart(2,"0")}`
    : `${now.getUTCFullYear()}${String(now.getUTCMonth()+1).padStart(2,"0")}${String(now.getUTCDate()).padStart(2,"0")}`;
  return `quota:${tool}:${uid}:${bucket}`;
}

