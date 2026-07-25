import dashboard from "@/data/dashboard.json";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // artificial delay so the loading state is actually visible
  await new Promise((resolve) => setTimeout(resolve, 700));

  // lets you demo the error state on demand: /api/dashboard?simulateError=true
  if (searchParams.get("simulateError") === "true") {
    return Response.json(
      { error: "Failed to fetch cluster data" },
      { status: 500 }
    );
  }

  return Response.json(dashboard);
}