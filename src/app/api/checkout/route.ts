import { NextRequest, NextResponse } from "next/server";
import { db, admin } from "@/lib/firebaseAdmin";
import { verifyUser } from "@/lib/auth-server";
import { razorpay } from "@/lib/razorpay";
import { MailService } from "@/lib/mail";

export async function POST(req: NextRequest) {
    try {
        const decodedToken = await verifyUser(req);
        const { itemId, itemType = "course", couponCode, userDetails } = await req.json();

        if (!itemId) return NextResponse.json({ error: "Item ID is required" }, { status: 400 });

        // 1. Fetch Item (Course or Event)
        const itemRef = db.collection(itemType === "course" ? "courses" : "events").doc(itemId);
        const itemDoc = await itemRef.get();
        if (!itemDoc.exists) return NextResponse.json({ error: "Item not found" }, { status: 404 });

        const itemData = itemDoc.data()!;
        let price = itemData.price || 0;

        // --- NEW: General Interest Notification ---
        // We notify admin as soon as the form is submitted (intent created)
        try {
            console.log(`[Checkout] Attempting to send interest notification for ${itemData.title}...`);
            await MailService.sendAdminInterestNotification("ianutkarsh@gmail.com", userDetails, itemData.title);
            console.log("[Checkout] Admin notification sent successfully.");
        } catch (mailError: any) {
            console.error("[Checkout] Failed to send admin notification:", mailError.message);
            // Non-blocking but logged
        }


        // 3. Handle Discounts / Free Logic
        const enrollCount = itemData.enrollmentCount || 0;
        if (enrollCount < 10) price = 0;
        else if (couponCode === "5050" && enrollCount < 20) price = Math.round(price * 0.5);

        // 4. Handle Free Enrollment
        if (price === 0) {
            await db.collection("users").doc(decodedToken.uid).update({
                enrolledCourses: admin.firestore.FieldValue.arrayUnion(itemId),
                ...(userDetails && { profileDetails: userDetails }) // Capture details if provided
            });
            return NextResponse.json({ success: true, type: "free" });
        }

        // 5. Create Razorpay Order
        const order = await razorpay.orders.create({
            amount: price * 100, // Amount in paise
            currency: "INR",
            receipt: `rcpt_${Date.now()}`,
            notes: {
                userId: decodedToken.uid,
                itemId,
                itemType,
                userDetails: JSON.stringify(userDetails) // Persist details for verification
            }
        });

        return NextResponse.json({ 
            success: true, 
            type: "paid",
            orderId: order.id,
            amount: order.amount,
            key: process.env.RAZORPAY_KEY_ID
        });

    } catch (error: any) {
        console.error("Checkout Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
