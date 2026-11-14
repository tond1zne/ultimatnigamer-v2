/** Povolené weby pro důkazy. Admin klikne jen na odkaz z těchto domén (ochrana před phishingem). */
export const PROOF_HOSTS = [
  "youtube.com", "youtu.be", "twitch.tv", "kick.com", "drive.google.com", "photos.app.goo.gl",
  "imgur.com", "streamable.com", "medal.tv", "gyazo.com", "prnt.sc", "ibb.co", "vimeo.com",
  "tiktok.com", "instagram.com", "discord.com", "cdn.discordapp.com", "dropbox.com",
  "onedrive.live.com", "1drv.ms", "mega.nz",
];

export function parseProofUrl(raw: string): string | null {
  const s = raw.trim();
  if (s.length < 10 || s.length > 500) return null;
  let u: URL;
  try { u = new URL(s); } catch { return null; }
  if (u.protocol !== "https:") return null;
  if (u.username || u.password) return null;
  const host = u.hostname.toLowerCase();
  if (!PROOF_HOSTS.some((d) => host === d || host.endsWith("." + d))) return null;
  return u.toString();
}

export const NAME_RE = /^[\p{L}\p{N}][\p{L}\p{N} _.\-]{1,23}$/u;
export const EMAIL_RE = /^[^\s@]{1,64}@[^\s@]{1,190}\.[^\s@]{2,}$/;
