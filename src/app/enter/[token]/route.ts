import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const siteToken = process.env.SITE_TOKEN;

  if (!siteToken || token !== siteToken) {
    return new Response("Not Found", { status: 404 });
  }

  const cookieStore = await cookies();
  cookieStore.set("louna_auth", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 365 * 24 * 60 * 60,
    path: "/",
  });

  redirect("/");
}
