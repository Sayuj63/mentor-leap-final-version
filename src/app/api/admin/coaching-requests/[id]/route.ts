import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-server";
import { CoachingService } from "@/services/coachingService";

export async function PATCH(req: NextRequest, { params }: any) {
    try {
        await verifyAdmin(req);
        const { id } = await params;
        const { status } = await req.json();
        
        await CoachingService.updateStatus(id, status);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: error.message.includes("Forbidden") ? 403 : 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: any) {
    try {
        await verifyAdmin(req);
        const { id } = await params;
        await CoachingService.deleteRequest(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: error.message.includes("Forbidden") ? 403 : 500 });
    }
}
