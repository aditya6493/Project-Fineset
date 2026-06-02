import { getServerSession, requireRole, unauthorized } from "@/lib/auth/session";
import { checkSseRateLimit, getRequestIdentifier } from "@/lib/rate-limit";
import { syncBroadcaster } from "@/lib/sync/broadcaster";
import {
  SSE_HEARTBEAT_MS,
  SSE_SERVER_MAX_CONNECTION_MS,
} from "@/lib/sync/constants";
import { computeSyncVersionLight } from "@/lib/sync/version";

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

  const initial = await computeSyncVersionLight(session);
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;
      const close = () => {
        if (closed) return;
        closed = true;
        clearInterval(heartbeat);
        clearTimeout(forceCloseTimer);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // stream already closed
        }
      };

      function send(data: unknown): void {
        if (closed) return;
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      }

      send(initial);

      const unsubscribe = syncBroadcaster.subscribe(scope, (payload) => {
        send(payload);
      });

      const heartbeat = setInterval(() => {
        if (closed) return;
        controller.enqueue(encoder.encode(": heartbeat\n\n"));
      }, SSE_HEARTBEAT_MS);

      // Close before serverless hard timeout to avoid runtime timeout errors.
      const forceCloseTimer = setTimeout(() => {
        close();
      }, SSE_SERVER_MAX_CONNECTION_MS);

      req.signal.addEventListener("abort", () => {
        close();
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
