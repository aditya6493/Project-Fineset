import { getServerSession, requireRole, unauthorized } from "@/lib/auth/session";
import { checkSseRateLimit, getRequestIdentifier } from "@/lib/rate-limit";
import { syncBroadcaster } from "@/lib/sync/broadcaster";
import { SSE_HEARTBEAT_MS } from "@/lib/sync/constants";
import { computeSyncVersion } from "@/lib/sync/version";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await getServerSession();
  if (!requireRole(session, ["STAFF", "STORE_MANAGER", "MASTER_ADMIN"])) {
    return unauthorized();
  }

  const identifier = await getRequestIdentifier();
  const rateLimit = await checkSseRateLimit(identifier);
  if (!rateLimit.success) {
    return new Response("Too many requests", { status: 429 });
  }

  const scope =
    session.role === "MASTER_ADMIN" ? "all" : session.storeId;

  const initial = await computeSyncVersion(session);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      function send(data: unknown): void {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      send(initial);

      const unsubscribe = syncBroadcaster.subscribe(scope, (payload) => {
        send(payload);
      });

      const heartbeat = setInterval(() => {
        controller.enqueue(encoder.encode(": heartbeat\n\n"));
      }, SSE_HEARTBEAT_MS);

      req.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        unsubscribe();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
