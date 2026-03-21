import { db, admin } from "@/lib/firebaseAdmin";

export interface CoachingRequest {
    id: string;
    name: string;
    email: string;
    phone: string;
    date: string;
    goal: string;
    status: "pending" | "scheduled" | "completed" | "cancelled";
    createdAt: admin.firestore.Timestamp | Date;
}

export const CoachingService = {
    async getAllRequests() {
        const snapshot = await db.collection("coachingRequests").orderBy("createdAt", "desc").get();
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as CoachingRequest));
    },

    async updateStatus(id: string, status: string) {
        await db.collection("coachingRequests").doc(id).update({
            status,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    },

    async deleteRequest(id: string) {
        await db.collection("coachingRequests").doc(id).delete();
    }
};
