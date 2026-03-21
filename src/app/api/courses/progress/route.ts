import { NextRequest, NextResponse } from "next/server";
import { verifyUser } from "@/lib/auth-server";
import { ProgressService } from "@/services/progressService";

export async function POST(req: NextRequest) {
    try {
        const decodedToken = await verifyUser(req);

        const { courseId, lessonId } = await req.json();
        
        if (!courseId || !lessonId) return NextResponse.json({ error: "courseId and lessonId are required" }, { status: 400 });
        
        await ProgressService.markLessonComplete((decodedToken as any).uid, courseId, lessonId);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function GET(req: NextRequest) {
    try {
        const decodedToken = await verifyUser(req);

        const { searchParams } = new URL(req.url);
        const courseId = searchParams.get("courseId");
        
        if (!courseId) return NextResponse.json({ error: "courseId is required" }, { status: 400 });
        
        const progress = await ProgressService.getCourseProgress((decodedToken as any).uid, courseId);
        return NextResponse.json({ progress });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
