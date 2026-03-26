import { NextRequest, NextResponse } from "next/server";
import { db, admin } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const secret = searchParams.get("secret");

    // Basic security for temporary migration script
    if (secret !== "mentorleap_migrate_2026") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        console.log("--- Starting Production SWI Migration ---");
        const bootcampId = "speak-with-impact-bootcamp";
        
        // 1. Clean up Courses Collection and Init/Sync SWI Event
        const swiInCourses = await db.collection("courses").doc(bootcampId).get();
        if (swiInCourses.exists) {
            await db.collection("courses").doc(bootcampId).delete();
        }

        // Ensure Event Metadata is correct in production
        await db.collection("events").doc(bootcampId).set({
            date: new Date("2026-03-28T19:00:00Z"), // Official start
            displayDate: "Saturday, 28th March & Sunday, 29th March",
            time: "7:00 PM - 9:00 PM IST",
            zoomLink: "https://us05web.zoom.us/j/85625593374?pwd=VqabWHfa5B5Uf4lkBXCsjtPLOLPw6C.1",
            meetingId: "856 2559 3374",
            passcode: "2VZXAJ",
            banner: "https://images.unsplash.com/photo-1475721027187-402ad2989a3b?w=800&q=80",
            thumbnail: "https://images.unsplash.com/photo-1475721027187-402ad2989a3b?w=800&q=80",
            imageUrl: "https://images.unsplash.com/photo-1475721027187-402ad2989a3b?w=1000&q=80",
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        }, { merge: true });

        // 2. Migrate User Documents
        const usersSnapshot = await db.collection("users").get();
        let migratedCount = 0;
        const batch = db.batch();
        let batchSize = 0;

        for (const doc of usersSnapshot.docs) {
            const userData = doc.data();
            const enrolledCourses = userData.enrolledCourses || [];
            const registeredEvents = userData.registeredEvents || [];

            if (enrolledCourses.includes(bootcampId)) {
                const newEnrolledCourses = enrolledCourses.filter((id: string) => id !== bootcampId);
                const newRegisteredEvents = Array.from(new Set([...registeredEvents, bootcampId]));

                batch.update(doc.ref, {
                    enrolledCourses: newEnrolledCourses,
                    registeredEvents: newRegisteredEvents
                });
                
                migratedCount++;
                batchSize++;

                // Commit in chunks of 500 (Firestore limit)
                if (batchSize === 500) {
                    await batch.commit();
                    batchSize = 0;
                }
            }
        }

        // Finalize enrollment count for the event
        await db.collection("events").doc(bootcampId).update({
            enrollmentCount: migratedCount
        });

        if (batchSize > 0) {
            await batch.commit();
        }

        return NextResponse.json({ 
            success: true, 
            message: `Migration complete. Updated ${migratedCount} users.`,
            note: "Speak With Impact has been moved from 'Courses' to 'Events' for all users." 
        });

    } catch (error: any) {
        console.error("Migration Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
