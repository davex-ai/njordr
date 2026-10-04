import { formatPrice } from "@/lib/format";

type Line = { title: string; unit_price: number; quantity: number };

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function orderHtml(orderId: string, lines: Line[], total: number) {
  const rows = lines
    .map(
      (l) => `<tr>
        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;color:#111827">${esc(l.title)}<br><span style="color:#6b7280;font-size:13px">Qty ${l.quantity}</span></td>
        <td style="padding:12px 0;border-bottom:1px solid #e5e7eb;text-align:right;color:#111827">${formatPrice(l.unit_price * l.quantity)}</td>
      </tr>`,
    )
    .join("");

  return `<!doctype html><html><body style="margin:0;background:#f7f6f2;font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 16px">
    <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:16px;padding:32px">
      <tr><td style="font-size:22px;font-weight:700;color:#1b4965;padding-bottom:4px">Njörðr</td></tr>
      <tr><td style="font-size:20px;font-weight:600;color:#111827;padding:16px 0 4px">Thanks, your order is confirmed</td></tr>
      <tr><td style="color:#6b7280;font-size:14px;padding-bottom:20px">Order #${esc(orderId.slice(0, 8).toUpperCase())}</td></tr>
      <tr><td><table width="100%" cellpadding="0" cellspacing="0">${rows}
        <tr><td style="padding-top:16px;font-weight:600;color:#111827">Total</td><td style="padding-top:16px;text-align:right;font-weight:700;color:#111827">${formatPrice(total)}</td></tr>
      </table></td></tr>
      <tr><td style="padding-top:28px;color:#6b7280;font-size:13px">You can see this order any time under Orders on Njörðr.</td></tr>
    </table>
  </td></tr></table></body></html>`;
}

export async function sendOrderEmail(opts: {
  to: string;
  orderId: string;
  lines: Line[];
  total: number;
}): Promise<boolean> {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  if (!apiKey || !senderEmail) return false;

  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": apiKey, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: { name: process.env.BREVO_SENDER_NAME ?? "Njörðr", email: senderEmail },
      to: [{ email: opts.to }],
      subject: `Your Njörðr order #${opts.orderId.slice(0, 8).toUpperCase()} is confirmed`,
      htmlContent: orderHtml(opts.orderId, opts.lines, opts.total),
    }),
  });
  if (!res.ok) console.error("Brevo error", res.status, await res.text());
  return res.ok;
}
