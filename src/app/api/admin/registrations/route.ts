import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebaseAdmin";
import { verifyUser, isAdmin } from "@/lib/auth-server";

export async function GET(req: NextRequest) {
    try {
        const decodedToken = await verifyUser(req);
        if (!(await isAdmin(decodedToken.email!))) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const snapshot = await db.collection("transactions")
            .orderBy("createdAt", "desc")
            .limit(100)
            .get();

        const transactions = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate()?.toISOString()
        }));

        // Enrich with user data if missing
        const enrichedRegistrations = await Promise.all(transactions.map(async (reg: any) => {
            if (reg.userDetails && reg.userDetails.fullName && reg.userDetails.email) {
                return reg;
            }

            // If transaction doesn't have details, check the users collection
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
                console.error("Enrichment error:", err);
            }
            return reg;
        }));

        return NextResponse.json(enrichedRegistrations);

    } catch (error: any) {
        console.error("Fetch Registrations Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
