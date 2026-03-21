import { db } from "../lib/firebaseAdmin";
import fs from "fs";

async function verify() {
  const swiInCourses = await db.collection("courses").doc("speak-with-impact-bootcamp").get();
  const swiInEvents = await db.collection("events").doc("speak-with-impact-bootcamp").get();

  const usersSnapshot = await db.collection("users").get();
  let countInCourses = 0;
  let countInEvents = 0;

  for (const doc of usersSnapshot.docs) {
    const data = doc.data();
    if ((data.enrolledCourses || []).includes("speak-with-impact-bootcamp")) countInCourses++;
    if ((data.registeredEvents || []).includes("speak-with-impact-bootcamp")) countInEvents++;
  }

  const results = {
    swiExistsInCourses: swiInCourses.exists,
    swiExistsInEvents: swiInEvents.exists,
    usersWithSwiInEnrolledCourses: countInCourses,
    usersWithSwiInRegisteredEvents: countInEvents
  };

  fs.writeFileSync("/tmp/verify_results.json", JSON.stringify(results, null, 2));
}

verify().catch(console.error);
