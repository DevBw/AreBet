import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "arebet",
    mode: process.env.NEXT_PUBLIC_USE_DEMO_DATA === "false" ? "api-preferred" : "demo",
    timestamp: new Date().toISOString(),
  });
}
