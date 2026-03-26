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

        const registrations = snapshot.docs.map((doc: any) => ({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate()?.toISOString()
        }));

        return NextResponse.json(registrations);

    } catch (error: any) {
        console.error("Fetch Registrations Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
