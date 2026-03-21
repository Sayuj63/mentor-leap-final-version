import { admin } from "@/lib/firebaseAdmin";

export interface Certificate {
    id?: string;
    userId: string;
    userName: string;
    courseId: string;
    courseTitle: string;
    certificateUrl: string; // Cloudinary URL

    issuedAt: admin.firestore.Timestamp | Date;
}
