/**
 * Simple Bearer token auth middleware using API_SECRET env var.
 * Usage in route handlers:
 *   if (!validateApiToken(request)) {
 *     return Response.json({ error: "Unauthorized" }, { status: 401 });
 *   }
 */
export function validateApiToken(request: Request): boolean {
  const authHeader = request.headers.get("authorization");
  if (authHeader) {
    const apiSecret = process.env.API_SECRET;
    if (!apiSecret) return false;
    const [scheme, token] = authHeader.split(" ");
    if (scheme === "Bearer" && token === apiSecret) return true;
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const allowedHosts = ["louna.bytech-solutions.cc", "louna-three.vercel.app", "localhost"];
  if (origin) {
    try {
      if (allowedHosts.some((h) => new URL(origin).hostname.includes(h))) return true;
    } catch {}
  }
  if (referer) {
    try {
      if (allowedHosts.some((h) => new URL(referer).hostname.includes(h))) return true;
    } catch {}
  }

  return false;
}
