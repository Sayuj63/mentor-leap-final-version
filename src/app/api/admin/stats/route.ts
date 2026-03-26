import { NextRequest, NextResponse } from "next/server";
import { verifyAdmin } from "@/lib/auth-server";
import { db } from "@/lib/firebaseAdmin";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    try {
        await verifyAdmin(req);

        // Run all counts in parallel
        const [usersSnap, coursesSnap, resourcesSnap, eventsSnap, registrationsSnap] = await Promise.all([
            db.collection("users").count().get(),
            db.collection("courses").count().get(),
            db.collection("resources").count().get(),
            db.collection("events").count().get(),
            // Real registrations = transactions for events
            db.collection("transactions").where("itemType", "==", "event").where("paymentStatus", "==", "success").get(),
        ]);

        // Calculate real revenue from successful transactions
        let totalRevenue = 0;
        registrationsSnap.forEach((doc: any) => {
            const data = doc.data();
            totalRevenue += data.amount || 0;
        });

        // Enrich & Sort recent registrations
        const recentRegistrations = await Promise.all(registrationsSnap.docs.map(async (doc: any) => {
            const reg = { id: doc.id, ...doc.data() };
            if (reg.userDetails && reg.userDetails.fullName && reg.userDetails.email) {
                return reg;
            }

            // Fallback for missing userDetails in transaction
            try {
                const userDoc = await db.collection("users").doc(reg.userId).get();
                if (userDoc.exists) {
                    const userData = userDoc.data()!;
                    const profile = userData.profileDetails || {};
                    return {
                        ...reg,
                        userDetails: {
                            fullName: profile.fullName || userData.displayName || "Unknown User",
                            email: profile.email || userData.email || "No Email",
                            phone: profile.phone || "No Phone",
                            ...profile
                        }
                    };
                }
            } catch (err) {
                console.error("Dashboard enrichment error:", err);
            }
            return reg;
        }));

        recentRegistrations.sort((a: any, b: any) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0));

        return NextResponse.json({
            users: usersSnap.data().count,
            courses: coursesSnap.data().count,
            resources: resourcesSnap.data().count,
            events: eventsSnap.data().count,
            revenue: totalRevenue,
            pendingRegistrations: registrationsSnap.size,
            recentRegistrations: recentRegistrations.slice(0, 5),
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: error.message.includes("Forbidden") ? 403 : 500 });
    }
}
