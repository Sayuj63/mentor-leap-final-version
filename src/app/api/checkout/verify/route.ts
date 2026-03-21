import { NextRequest, NextResponse } from "next/server";
import { db, admin } from "@/lib/firebaseAdmin";
import { verifyUser } from "@/lib/auth-server";
import { razorpay } from "@/lib/razorpay";
import crypto from "crypto";

export async function POST(req: NextRequest) {
    try {
        const decodedToken = await verifyUser(req);
        const { 
            razorpay_order_id, 
            razorpay_payment_id, 
            razorpay_signature,
            itemId,
            itemType = "course"
        } = await req.json();

        // 1. Verify Signature
        const secret = process.env.RAZORPAY_KEY_SECRET!;
        const generated_signature = crypto
            .createHmac("sha256", secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest("hex");

        if (generated_signature !== razorpay_signature) {
            return NextResponse.json({ error: "Invalid payment signature" }, { status: 400 });
        }

        // 2. Fetch Order to get userDetails from notes
        const order = await razorpay.orders.fetch(razorpay_order_id);
        const userDetailsStr = order.notes?.userDetails;
        const userDetails = userDetailsStr ? JSON.parse(userDetailsStr as string) : null;

        // 3. Update User & Create Transaction
        const batch = db.batch();
        const userRef = db.collection("users").doc(decodedToken.uid);
        const txRef = db.collection("transactions").doc();

        if (itemType === "course") {
            batch.update(userRef, { 
                enrolledCourses: admin.firestore.FieldValue.arrayUnion(itemId),
                ...(userDetails && { profileDetails: userDetails })
            });
        } else if (itemType === "event") {
            batch.update(userRef, { 
                registeredEvents: admin.firestore.FieldValue.arrayUnion(itemId),
                ...(userDetails && { profileDetails: userDetails })
            });
        }

        batch.set(txRef, {
            userId: decodedToken.uid,
            itemId,
            itemType,
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            paymentStatus: "success",
            paymentGateway: "razorpay",
            userDetails: userDetails, // Save details in transaction
            createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // 4. Update Item Enrollment Count
        const itemRef = db.collection(itemType === "course" ? "courses" : "events").doc(itemId);
        batch.update(itemRef, {
            enrollmentCount: admin.firestore.FieldValue.increment(1)
        });

        await batch.commit();

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Verification Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
