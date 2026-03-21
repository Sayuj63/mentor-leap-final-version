import { NextRequest, NextResponse } from "next/server";
import { verifyUser } from "@/lib/auth-server";
import { db } from "@/lib/firebaseAdmin";

export async function POST(req: NextRequest) {
    try {
        const decodedToken = await verifyUser(req);
        const { courseId } = await req.json();
        
        if (!courseId) return NextResponse.json({ error: "courseId is required" }, { status: 400 });
        
        await db.collection("users").doc((decodedToken as any).uid).update({
            lastCourseId: courseId
        });
        
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
