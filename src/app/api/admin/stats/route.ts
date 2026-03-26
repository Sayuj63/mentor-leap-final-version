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

        // Sort recent registrations
        const recentRegistrations = [...registrationsSnap.docs]
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .sort((a: any, b: any) => (b.createdAt?.toDate?.() || 0) - (a.createdAt?.toDate?.() || 0))
            .slice(0, 5);

        return NextResponse.json({
            users: usersSnap.data().count,
            courses: coursesSnap.data().count,
            resources: resourcesSnap.data().count,
            events: eventsSnap.data().count,
            revenue: totalRevenue,
            pendingRegistrations: registrationsSnap.size,
            recentRegistrations,
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: error.message.includes("Forbidden") ? 403 : 500 });
    }
}
