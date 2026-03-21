import { NextRequest, NextResponse } from "next/server";
import { db, admin } from "@/lib/firebaseAdmin";
import { verifyUser } from "@/lib/auth-server";
import { z } from "zod";
import { MailService } from "@/lib/mail";

export const dynamic = "force-dynamic";

const enrollmentSchema = z.object({
    courseId: z.string().optional(),
    courseIds: z.array(z.string()).optional(),
}).refine(data => data.courseId || (data.courseIds && data.courseIds.length > 0), {
    message: "Either courseId or courseIds must be provided",
});

export async function POST(req: NextRequest) {
    try {
        const decodedToken = await verifyUser(req);
        const uid = decodedToken.uid;
        const userEmail = decodedToken.email;
        const userName = decodedToken.name || decodedToken.email?.split("@")[0] || "Student";

        const body = await req.json();
        const validation = enrollmentSchema.safeParse(body);
        
        if (!validation.success) {
            return NextResponse.json({ error: validation.error.format() }, { status: 400 });
        }

        const { courseId, courseIds: bodyCourseIds } = validation.data;
        const courseIds = bodyCourseIds || (courseId ? [courseId] : []);

        // 1. Verify all courses exist and are free
        const coursesRef = db.collection("courses");
        const validCourseIds: string[] = [];
        const validCourseTitles: string[] = [];

        for (const cId of courseIds) {
            const isSWI = cId === "speak-with-impact-bootcamp";
            const collectionName = isSWI ? "events" : "courses";
            
            const courseDoc = await db.collection(collectionName).doc(cId).get();
            if (!courseDoc.exists) {
                return NextResponse.json({ error: `${isSWI ? "Event" : "Course"} not found: ${cId}` }, { status: 404 });
            }

            const courseData = courseDoc.data() || {};
            const price = courseData.price || 0;
            const title = courseData.title || cId;

            if (price > 0) {
                // Special check for "First 10 people free" logic
                if (isSWI) {
                    const txSnapshot = await db.collection("transactions")
                        .where("itemId", "==", cId)
                        .where("paymentStatus", "==", "success")
                        .count()
                        .get();
                    
                    if (txSnapshot.data().count >= 10) {
                        return NextResponse.json({ error: "Free spots for this bootcamp are fully claimed. Please pay to enroll." }, { status: 403 });
                    }
                } else {
                    return NextResponse.json({ error: `Course requires payment: ${cId}` }, { status: 403 });
                }
            }

            validCourseIds.push(cId);
            validCourseTitles.push(title);
        }

        // 2. Add to user's enrolledCourses / registeredEvents
        const userRef = db.collection("users").doc(uid);
        const batch = db.batch();

        for (const cId of validCourseIds) {
            const isSWI = cId === "speak-with-impact-bootcamp";
            const fieldName = isSWI ? "registeredEvents" : "enrolledCourses";
            
            batch.update(userRef, {
                [fieldName]: admin.firestore.FieldValue.arrayUnion(cId)
            });
        }

        // 3. Create transaction records
        const transactionsRef = db.collection("transactions");

        for (const cId of validCourseIds) {
            const isSWI = cId === "speak-with-impact-bootcamp";
            const newTxRef = transactionsRef.doc();
            batch.set(newTxRef, {
                userId: uid,
                itemId: cId,
                itemType: isSWI ? "event" : "course",
                amount: 0,
                paymentStatus: "success",
                paymentGateway: "free",
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            });
        }

        await batch.commit();

        // 4. Send Confirmation Email (Async - don't block response)
        if (userEmail) {
            const courseTitle = validCourseTitles.length > 1 
                ? `${validCourseTitles[0]} (+${validCourseTitles.length - 1} more)`
                : validCourseTitles[0];
            
            MailService.sendBookingConfirmation(userEmail, userName, courseTitle)
                .catch(err => console.error("Post-enrollment email failed:", err));
        }

        return NextResponse.json({ 
            success: true, 
            message: `Enrolled successfully in ${validCourseIds.length} course(s)` 
        });
    } catch (error: any) {
        console.error("Enrollment Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
