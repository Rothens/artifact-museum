import { readFileSync } from "fs";
import { resolvePhotoFile, resolveThumbFile } from "../../../../lib/photos.js";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const { itemId } = await params;
  const { searchParams } = new URL(request.url);
  const thumb = searchParams.get("thumb") === "1";

  const file = thumb
    ? (resolveThumbFile(itemId) ?? resolvePhotoFile(itemId))
    : resolvePhotoFile(itemId);

  if (!file) {
    return new Response("Not found", { status: 404 });
  }

  const buf = readFileSync(file.path);

  return new Response(buf, {
    status: 200,
    headers: {
      "Content-Type": file.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Length": String(buf.length),
    },
  });
}
