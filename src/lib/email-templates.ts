const BRAND_NAME = import.meta.env.BRAND_NAME ?? process.env.BRAND_NAME ?? "Harmony Threads";
const BRAND_ACCENT = "#c0392b";
const SITE_URL = (import.meta.env.PUBLIC_SITE_URL ?? process.env.PUBLIC_SITE_URL ?? "").replace(/\/$/, "");

function layout(content: string, preheader = ""): string {
  return `<!DOCTYPE html>
<html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" />
<style>
  body { margin:0; padding:0; background:#0d0b0f; font-family: -apple-system, sans-serif; color:#f0ece3; }
  .preheader { display:none !important; font-size:1px; max-height:0; overflow:hidden; }
  .container { max-width:560px; margin:0 auto; padding:32px 24px; }
  .card { background:#171419; border:1px solid rgba(240,236,227,0.1); border-radius:8px; padding:32px; }
  h1 { font-family: Georgia, serif; font-size:28px; line-height:1.2; margin:0 0 16px; color:#f0ece3; }
  p { font-size:15px; line-height:1.6; margin:0 0 16px; color:#a09a93; }
  .btn { display:inline-block; background:${BRAND_ACCENT}; color:#fff !important; padding:12px 24px; border-radius:6px; text-decoration:none; font-weight:600; }
  .muted { color:#5a5a5a; font-size:13px; }
  .dot { display:inline-block; width:8px; height:8px; border-radius:50%; background:${BRAND_ACCENT}; margin-right:8px; }
  a { color: ${BRAND_ACCENT}; }
</style></head><body>
<span class="preheader">${preheader}</span>
<div class="container">
  <div style="margin-bottom:24px;"><span class="dot"></span><strong style="font-size:18px;color:#f0ece3;">${BRAND_NAME}</strong></div>
  <div class="card">${content}</div>
  <p class="muted" style="text-align:center;margin-top:24px;"><a href="${SITE_URL}">${SITE_URL.replace(/^https?:\/\//, "")}</a></p>
</div>
</body></html>`;
}

export function orderConfirmationHtml({ orderId, amount, currency }: { orderId: string; amount: string; currency: string }) {
  return layout(`<h1>Order confirmed</h1><p>Thanks for your order!</p><p><strong style="color:#f0ece3;">Order:</strong> ${orderId}<br/><strong style="color:#f0ece3;">Total:</strong> ${currency} ${amount}</p><p><a class="btn" href="${SITE_URL}">Visit store</a></p><p class="muted">Rock on.</p>`, `Order ${orderId} confirmed`);
}

export function contactAckHtml({ name }: { name: string }) {
  return layout(`<h1>Got your message</h1><p>Hey ${name} — we'll get back to you within 1 business day.</p><p class="muted">The Harmony Threads team</p>`, "We got your message");
}

export function subscribeAckHtml({ email }: { email: string }) {
  return layout(`<h1>You're in</h1><p>Welcome to the list. First to know about new drops and dispatches.</p><p><a class="btn" href="${SITE_URL}/shop">Browse the store</a></p>`, "Welcome to Harmony Threads");
}
