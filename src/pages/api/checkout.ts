import type { APIRoute } from "astro";
import { stripe } from "../../lib/stripe";
import { anonClient } from "../../lib/supabase";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  let body: any;
  try { body = await request.json(); } catch { return new Response(JSON.stringify({ error: "Invalid JSON" }), { status: 400, headers: { "Content-Type": "application/json" } }); }
  const { items, customer_email } = body as { items: Array<{ product_id: string; qty: number; variant_sku?: string; variant_label?: string }>; customer_email?: string; };
  if (!items?.length) return new Response(JSON.stringify({ error: "Empty cart" }), { status: 400, headers: { "Content-Type": "application/json" } });
  const sb = anonClient();
  if (!sb) return new Response(JSON.stringify({ error: "Server not configured" }), { status: 500, headers: { "Content-Type": "application/json" } });
  const { data: products, error } = await sb.from("products").select("id, slug, name, description, price_pence, currency, image_url").in("id", items.map((i: any) => i.product_id));
  if (error || !products?.length) return new Response(JSON.stringify({ error: "Products not found" }), { status: 400, headers: { "Content-Type": "application/json" } });
  const line_items = items.map((it: any) => {
    const p = products.find((x: any) => x.id === it.product_id);
    if (!p) throw new Error(`Unknown product ${it.product_id}`);
    const label = it.variant_label ? ` (${it.variant_label})` : "";
    return { quantity: Math.max(1, Math.floor(it.qty)), price_data: { currency: (p.currency ?? "usd").toLowerCase(), unit_amount: p.price_pence, product_data: { name: p.name + label, description: p.description?.slice(0, 300) ?? undefined, images: p.image_url ? [p.image_url] : undefined, metadata: { product_id: p.id, slug: p.slug } } } };
  });
  const origin = import.meta.env.PUBLIC_SITE_URL ?? `${request.headers.get("x-forwarded-proto") ?? "https"}://${request.headers.get("x-forwarded-host") ?? request.headers.get("host")}`;
  const session = await stripe().checkout.sessions.create({ mode: "payment", line_items, customer_email: customer_email ?? undefined, success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`, cancel_url: `${origin}/checkout/cancel`, metadata: { cart: JSON.stringify(items).slice(0, 500) }, shipping_address_collection: { allowed_countries: ["US", "CA", "GB", "AU", "NZ", "DE", "FR", "NL"] } });
  return new Response(JSON.stringify({ url: session.url }), { status: 200, headers: { "Content-Type": "application/json" } });
};
