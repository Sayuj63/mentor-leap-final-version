import { db, admin } from "@/lib/firebaseAdmin";
import { Transaction } from "@/models/Transaction";

export const TransactionService = {
    async createTransaction(data: Omit<Transaction, "id" | "createdAt" | "paymentStatus">) {
        const transRef = db.collection("transactions").doc();
        const transData = {
            ...data,
            id: transRef.id,
            paymentStatus: "pending",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };
        await transRef.set(transData);
        return transData;
    },

    async updateTransactionStatus(transactionId: string, status: "success" | "failed") {
        const transRef = db.collection("transactions").doc(transactionId);
        await transRef.update({ paymentStatus: status });

        // If success, fulfill the order (e.g., enroll in course)
        if (status === "success") {
            const transDoc = await transRef.get();
            const transaction = transDoc.data() as Transaction;
            
            if (transaction.itemType === "course") {
                // 1. Mark as enrolled in User doc
                await db.collection("users").doc(transaction.userId).update({
                    enrolledCourses: admin.firestore.FieldValue.arrayUnion(transaction.itemId),
                });

                // 2. Trigger Confirmation Email
                try {
                    const [userDoc, courseDoc] = await Promise.all([
                        db.collection("users").doc(transaction.userId).get(),
                        db.collection("courses").doc(transaction.itemId).get(),
                    ]);

                    const userData = userDoc.data();
                    const courseData = courseDoc.data();

                    if (userData?.email) {
                        const { MailService } = await import("@/lib/mail");
                        const userName = userData.name || userData.email.split("@")[0] || "Student";
                        const courseTitle = courseData?.title || transaction.itemId;
                        
                        await MailService.sendBookingConfirmation(userData.email, userName, courseTitle);
                    }
                } catch (err) {
                    console.error("Delayed email confirmation failed:", err);
                }
            }
        }
    },

    async getUserTransactions(uid: string) {
        const snapshot = await db
            .collection("transactions")
            .where("userId", "==", uid)
            .orderBy("createdAt", "desc")
            .get();
        return snapshot.docs.map((doc: any) => doc.data() as Transaction);
    },
};
