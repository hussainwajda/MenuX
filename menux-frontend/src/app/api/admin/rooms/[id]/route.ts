import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function proxy(request: NextRequest, id: string) {
  try {
    const headers = new Headers();
    const authorization = request.headers.get("authorization");
    const contentType = request.headers.get("content-type");

    if (authorization) headers.set("Authorization", authorization);
    if (contentType) headers.set("Content-Type", contentType);

    const method = request.method;
    const init: RequestInit = { method, headers };

    if (method !== "GET" && method !== "HEAD") {
      const body = await request.text();
      if (body) init.body = body;
    }

    const response = await fetch(`${API_BASE_URL}/api/admin/rooms/${id}`, init);
    const raw = await response.text();

    return new NextResponse(raw, {
      status: response.status,
      headers: {
        "Content-Type": response.headers.get("content-type") || "application/json",
      },
    });
  } catch {
    return NextResponse.json({ error: "Proxy request failed" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return proxy(request, id);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return proxy(request, id);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  return proxy(request, id);
}
