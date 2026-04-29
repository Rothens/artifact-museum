import { makeClearCookie } from "../../../lib/auth.js";

export async function POST() {
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/login",
      "Set-Cookie": makeClearCookie(),
    },
  });
}
