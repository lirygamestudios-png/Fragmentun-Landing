/**
 * LiryBoost: contrato de enlaces de invitación en preproducción.
 * NO genera ni registra códigos, NO acredita invitaciones.
 * El servidor deberá emitir tokens criptográficamente aleatorios,
 * almacenar solamente sus digests y comprobar identidad/consentimiento.
 */
export const LIRYBOOST_REFERRAL_PARAMETER = "liry_ref" as const;
const REFERRAL_TOKEN_PATTERN = /^[A-Za-z0-9_-]{22,86}$/;

export function parseLiryBoostReferralToken(raw: unknown): string | null {
  if (typeof raw !== "string" || !REFERRAL_TOKEN_PATTERN.test(raw)) return null;
  return raw;
}

export function makeLiryBoostReferralLink(
  canonicalOrigin: unknown,
  issuedToken: unknown
): string | null {
  const token = parseLiryBoostReferralToken(issuedToken);
  if (!token || typeof canonicalOrigin !== "string") return null;
  let origin: URL;
  try { origin = new URL(canonicalOrigin); } catch { return null; }
  // Nunca emitir códigos sobre un dominio de preview o un origen arbitrario.
  if (origin.protocol !== "https:" || origin.username || origin.password ||
      origin.search || origin.hash || origin.pathname !== "/") return null;
  const hostname = origin.hostname.toLowerCase();
  if (hostname === "localhost" || hostname.endsWith(".vercel.app")) return null;
  const result = new URL("/lirygames", origin.origin);
  result.searchParams.set(LIRYBOOST_REFERRAL_PARAMETER, token);
  return result.toString();
}
