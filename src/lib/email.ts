import { orderConfirmationHtml, contactAckHtml, subscribeAckHtml } from "./email-templates";

const RESEND_KEY = import.meta.env.RESEND_API_KEY ?? process.env.RESEND_API_KEY ?? "";
const FROM = import.meta.env.EMAIL_FROM ?? process.env.EMAIL_FROM ?? "Harmony Threads <onboarding@resend.dev>";
const REPLY_TO = import.meta.env.EMAIL_REPLY_TO ?? process.env.EMAIL_REPLY_TO ?? undefined;

type SendArgs = { to: string | string[]; subject: string; html: string; text?: string; replyTo?: string; tags?: Array<{ name: string; value: string }>; };

export async function sendEmail(args: SendArgs): Promise<{ ok: boolean; id?: string; error?: string }> {
  if (!RESEND_KEY) { console.warn("[email] RESEND_API_KEY not set"); return { ok: false, error: "RESEND_API_KEY not set" }; }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${RESEND_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: FROM, to: Array.isArray(args.to) ? args.to : [args.to], subject: args.subject, html: args.html, reply_to: args.replyTo ?? REPLY_TO, tags: args.tags }),
    });
    if (!res.ok) { const body = await res.text(); return { ok: false, error: `Resend ${res.status}: ${body.slice(0,200)}` }; }
    const json = await res.json() as { id?: string };
    return { ok: true, id: json.id };
  } catch (err: any) { return { ok: false, error: err?.message ?? String(err) }; }
}

export async function sendOrderConfirmation(args: { to: string; orderId: string; amount: string; currency: string }) {
  return sendEmail({ to: args.to, subject: `Order ${args.orderId} confirmed`, html: orderConfirmationHtml(args), tags: [{ name: "type", value: "order_confirmation" }] });
}

export async function sendContactAck(args: { to: string; name: string }) {
  return sendEmail({ to: args.to, subject: "We got your message — Harmony Threads", html: contactAckHtml({ name: args.name }), tags: [{ name: "type", value: "contact_ack" }] });
}

export async function sendSubscribeAck(args: { to: string }) {
  return sendEmail({ to: args.to, subject: "You're on the list — Harmony Threads", html: subscribeAckHtml({ email: args.to }), tags: [{ name: "type", value: "subscribe_ack" }] });
}
