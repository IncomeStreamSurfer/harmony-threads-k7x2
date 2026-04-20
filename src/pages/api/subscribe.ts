import type { APIRoute } from "astro";
import { serviceClient } from "../../lib/supabase";
import { sendSubscribeAck } from "../../lib/email";
import { hitOrReject } from "../../lib/rate-limit";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  const ip = (request.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  const rl = hitOrReject(ip);
  if (!rl.ok) return new Response(JSON.stringify({ error: "Too many requests" }), { status: 429, headers: { "Retry-After": String(rl.retryAfterSec), "Content-Type": "application/json" } });
  let body: any;
  try { body = await request.json(); } catch { return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { "Content-Type": "application/json" } }); }
  if (body.website) return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
  const age = Date.now() - Number(body.renderedAt ?? 0);
  if (age < 3000 || age > 86400000) return new Response(JSON.stringify({ error: "Form expired" }), { status: 400, headers: { "Content-Type": "application/json" } });
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return new Response(JSON.stringify({ error: "Invalid email" }), { status: 400, headers: { "Content-Type": "application/json" } });
  const sb = serviceClient();
  if (sb) await sb.from("subscribers").insert({ email, source: "homepage" }).onConflict("email").ignore();
  await sendSubscribeAck({ to: email }).catch(() => {});
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "Content-Type": "application/json" } });
};
