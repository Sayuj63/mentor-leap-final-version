import { db, admin } from "@/lib/firebaseAdmin";
import { CertificateService } from "./certificateService";
import { CourseService } from "./courseService";

export const ProgressService = {
    async markLessonComplete(userId: string, courseId: string, lessonId: string) {
        const userRef = db.collection("users").doc(userId);
        
        await db.runTransaction(async (transaction: any) => {
            const userDoc = await transaction.get(userRef);
            if (!userDoc.exists) throw new Error("User not found");
            
            const userData = userDoc.data() || {};
            const completedLessons = userData.completedLessons || {};
            const courseCompleted = completedLessons[courseId] || [];
            
            if (courseCompleted.includes(lessonId)) return; // Already completed
            
            const updatedCompleted = {
                ...completedLessons,
                [courseId]: [...courseCompleted, lessonId]
            };
            
            // Calculate percentage for dashboard sync
            const course = await CourseService.getCourse(courseId);
            let percentage = 0;
            if (course) {
                const totalLessons = course.modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
                percentage = totalLessons > 0 ? Math.round((updatedCompleted[courseId].length / totalLessons) * 100) : 0;
            }

            transaction.update(userRef, {
                completedLessons: updatedCompleted,
                [`courseProgress.${courseId}`]: percentage,
                lastCourseId: courseId,
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            });

            // Check if course is now 100% complete
            if (course && percentage === 100) {

                const totalLessons = course.modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
                if (updatedCompleted[courseId].length === totalLessons) {
                    // Auto-issue certificate
                    await CertificateService.issueCertificate({ 
                        userId, 
                        userName: userData.name || "Student",
                        courseId, 
                        courseTitle: course.title,
                        certificateUrl: "https://res.cloudinary.com/dummy/certificate.pdf" // Placeholder until actual generation
                    });
                }


            }
        });
    },

    async getCourseProgress(userId: string, courseId: string) {
        const userDoc = await db.collection("users").doc(userId).get();
        if (!userDoc.exists) return 0;
        
        const completed = userDoc.data()?.completedLessons?.[courseId] || [];
        const course = await CourseService.getCourse(courseId);
        if (!course) return 0;
        
        const total = course.modules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);
        return total > 0 ? Math.round((completed.length / total) * 100) : 0;
    }
};
