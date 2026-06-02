import { NextResponse } from "next/server";
import {
  badRequest,
  getServerSession,
  requireRole,
  unauthorized,
} from "@/lib/auth/session";
import { importVisitsFromCsv } from "@/lib/services/visit-import";

export async function POST(req: Request) {
  const session = await getServerSession();
  if (!requireRole(session, ["STORE_MANAGER"])) return unauthorized();

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return badRequest({ message: "Invalid multipart form data" });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return badRequest({ message: "CSV file is required" });
  }
  if (!file.name.toLowerCase().endsWith(".csv")) {
    return badRequest({ message: "Please upload a .csv file" });
  }

  const csv = await file.text();
  if (!csv.trim()) {
    return badRequest({ message: "CSV file is empty" });
  }

  const result = await importVisitsFromCsv({
    csv,
    storeId: session.storeId,
  });

  return NextResponse.json(result);
}

