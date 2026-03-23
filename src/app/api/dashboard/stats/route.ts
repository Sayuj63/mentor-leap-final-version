import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { verifyUser } from "@/lib/auth-server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        const decodedToken = await verifyUser(req);
        const uid = decodedToken.uid;

        // Fetch user data
        const userRef = db.collection("users").doc(uid);
        const userDoc = await userRef.get();
        let userData: any = {};

        if (!userDoc.exists) {
            // Auto-provision user if they authenticated but have no firestore doc
            userData = {
                name: decodedToken.name || "Student",
                email: decodedToken.email || "",
                photoURL: decodedToken.picture || "",
                role: "student",
                enrolledCourses: [],
                registeredEvents: [],
                certificates: [],
                createdAt: new Date(),
            };
            await userRef.set(userData);
        } else {
            userData = userDoc.data() || {};
        }

        const enrolledCourseIds: string[] = (userData.enrolledCourses || []).filter((id: string) => id !== "speak-with-impact-bootcamp");
        const registeredEventIds: string[] = userData.registeredEvents || [];
        const certificateIds: string[] = userData.certificates || [];

        // Fetch upcoming events count (events in the future that the user is registered for)
        let upcomingEventsCount = 0;
        if (registeredEventIds.length > 0) {
            const now = new Date();
            const eventsSnap = await db
                .collection("events")
                .where("__name__", "in", registeredEventIds.slice(0, 10))
                .get();
            eventsSnap.forEach((doc: any) => {
                const eventData = doc.data();
                const rawDate = eventData.date;
                let eventDate: Date | null = null;
                
                try {
                    if (rawDate?._seconds) {
                        eventDate = new Date(rawDate._seconds * 1000);
                    } else if (rawDate?.toDate) {
                        eventDate = rawDate.toDate();
                    } else if (rawDate instanceof Date || typeof rawDate === 'string') {
                        eventDate = new Date(rawDate);
                    } else if (rawDate && typeof rawDate === 'object' && 'seconds' in rawDate) {
                        eventDate = new Date((rawDate as any).seconds * 1000);
                    }
                } catch (e) {
                    console.error("[Stats API] Date parsing error:", e);
                }

                const isUpcoming = eventDate && !isNaN(eventDate.getTime()) 
                    ? eventDate >= now 
                    : (doc.id === "speak-with-impact-bootcamp"); // Fail-safe for critical launch event
                
                if (isUpcoming) upcomingEventsCount++;
            });
        }

        // Fetch "Continue Learning" course
        let continueLearning = null;
        const lastCourseId = userData.lastCourseId;
        if (lastCourseId) {
            const courseDoc = await db.collection("courses").doc(lastCourseId).get();
            if (courseDoc.exists) {
                const courseData = courseDoc.data();
                continueLearning = {
                    id: courseDoc.id,
                    title: courseData?.title,
                    thumbnail: courseData?.thumbnail,
                    progress: userData.courseProgress?.[lastCourseId] || 0,
                };
            }
        } else if (enrolledCourseIds.length > 0) {
            // Fall back to first enrolled course if no lastCourseId
            const courseDoc = await db.collection("courses").doc(enrolledCourseIds[0]).get();
            if (courseDoc.exists) {
                const courseData = courseDoc.data();
                continueLearning = {
                    id: courseDoc.id,
                    title: courseData?.title,
                    thumbnail: courseData?.thumbnail,
                    progress: userData.courseProgress?.[enrolledCourseIds[0]] || 0,
                };
            }
        }

        return NextResponse.json({
            name: userData.name || "Student",
            email: userData.email || "",
            photoURL: userData.photoURL || "",
            activeCourses: enrolledCourseIds.length,
            upcomingEvents: upcomingEventsCount,
            certificates: certificateIds.length,
            continueLearning,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 401 });
    }
}
