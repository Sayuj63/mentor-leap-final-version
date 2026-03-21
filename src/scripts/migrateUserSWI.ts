import { db, admin } from "../lib/firebaseAdmin";

async function migrateSWI() {
  console.log("--- Starting SWI User Migration ---");

  // 1. Clean up Courses Collection (Double Check)
  console.log("Checking courses collection...");
  const swiInCourses = await db.collection("courses").doc("speak-with-impact-bootcamp").get();
  if (swiInCourses.exists) {
    console.log("Found SWI in courses collection. Deleting...");
    await db.collection("courses").doc("speak-with-impact-bootcamp").delete();
  } else {
    console.log("SWI not found in courses collection (Verified).");
  }

  // 2. Migrate User Data
  console.log("Migrating user enrollment data...");
  const usersSnapshot = await db.collection("users").get();
  const bootcampId = "speak-with-impact-bootcamp";
  let migratedCount = 0;

  for (const doc of usersSnapshot.docs) {
    const userData = doc.data();
    const enrolledCourses = userData.enrolledCourses || [];
    const registeredEvents = userData.registeredEvents || [];

    if (enrolledCourses.includes(bootcampId)) {
      console.log(`Migrating user: ${doc.id}`);
      
      const newEnrolledCourses = enrolledCourses.filter((id: string) => id !== bootcampId);
      const newRegisteredEvents = Array.from(new Set([...registeredEvents, bootcampId]));

      await doc.ref.update({
        enrolledCourses: newEnrolledCourses,
        registeredEvents: newRegisteredEvents
      });
      migratedCount++;
    }
  }

  console.log(`--- Migration Complete. Migrated ${migratedCount} users. ---`);
}

migrateSWI().catch(console.error);
