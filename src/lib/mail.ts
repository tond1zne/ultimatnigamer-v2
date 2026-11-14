import { SITE_NAME } from "@/lib/site";

export function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export const baseUrl = () => (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");

export function mailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.MAIL_FROM);
}

/** Posílá přes Resend HTTP API. Klíč se čte jen ze serverového prostředí a nikam se neloguje. */
export async function sendMail(opts: { to: string | string[]; subject: string; html: string }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.MAIL_FROM;
  if (!key || !from) {
    console.warn("[mail] RESEND_API_KEY / MAIL_FROM nejsou nastavené, e-mail se neodeslal.");
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: opts.to, subject: opts.subject, html: opts.html }),
    });
    if (!res.ok) console.error("[mail] Resend vrátil chybu", res.status);
    return res.ok;
  } catch {
    console.error("[mail] Odeslání selhalo.");
    return false;
  }
}

function shell(inner: string) {
  return `<div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;border:3px solid #000">
<h2 style="margin:0 0 16px">${escapeHtml(SITE_NAME)}</h2>${inner}</div>`;
}
const button = (href: string, text: string) =>
  `<p style="margin:24px 0"><a href="${escapeHtml(href)}" style="background:#000;color:#fff;padding:12px 20px;text-decoration:none;font-weight:bold;display:inline-block">${escapeHtml(text)}</a></p>`;

export const verificationMail = (name: string, url: string) =>
  shell(`<p>Ahoj ${escapeHtml(name)}, potvrď svůj e-mail a můžeš začít plnit výzvy.</p>${button(url, "Potvrdit e-mail")}
<p style="color:#555;font-size:12px">Odkaz platí 24 hodin. Pokud ses neregistroval(a), e-mail ignoruj.</p>`);

export const adminMail = (o: { user: string; challenge: string; proofUrl: string; adminUrl: string }) =>
  shell(`<p><b>${escapeHtml(o.user)}</b> poslal(a) důkaz k výzvě <b>${escapeHtml(o.challenge)}</b>.</p>
<p>Odkaz: ${escapeHtml(o.proofUrl)}</p>${button(o.adminUrl, "Posoudit důkaz")}
<p style="color:#555;font-size:12px">Notifikace vypneš v Admin > Nastavení.</p>`);
