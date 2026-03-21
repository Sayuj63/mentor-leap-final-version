import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-server";
import { CoachingService } from "@/services/coachingService";

export async function GET(req: NextRequest) {
    try {
        await verifyAdmin(req);
        const requests = await CoachingService.getAllRequests();
        return NextResponse.json(requests);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: error.message.includes("Forbidden") ? 403 : 500 });
    }
}
