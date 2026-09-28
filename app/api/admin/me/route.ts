import { NextResponse } from "next/server";
import { getAdminContext } from "@/lib/admin-auth";

export async function GET() {
  const ctx = await getAdminContext();
  if (!ctx) return NextResponse.json({ authenticated: false }, { status: 401 });
  return NextResponse.json({ authenticated: true, email: ctx.email, role: ctx.role });
}
