/**
 * Simple Bearer token auth middleware using API_SECRET env var.
 * Usage in route handlers:
 *   if (!validateApiToken(request)) {
 *     return Response.json({ error: "Unauthorized" }, { status: 401 });
 *   }
 */
export function validateApiToken(request: Request): boolean {
  const apiSecret = process.env.API_SECRET;

  if (!apiSecret) {
    console.error("API_SECRET environment variable is not set");
    return false;
  }

  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return false;
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return false;
  }

  return token === apiSecret;
}
