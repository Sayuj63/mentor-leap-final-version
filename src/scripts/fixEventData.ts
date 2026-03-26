import { config } from "dotenv";
config({ path: ".env.local" });
import { db } from "../lib/firebaseAdmin";

async function fixEventData() {
  console.log("--- Fixing Event Data (Dates & Zoom Link) ---");
  const bootcampId = "speak-with-impact-bootcamp";
  
  await db.collection("events").doc(bootcampId).set({
    date: new Date("2026-03-28T19:00:00Z"), 
    displayDate: "Saturday, 28th March & Sunday, 29th March",
    zoomLink: "https://us05web.zoom.us/j/85625593374?pwd=VqabWHfa5B5Uf4lkBXCsjtPLOLPw6C.1",
    meetingId: "856 2559 3374",
    passcode: "2VZXAJ",
    updatedAt: new Date()
  }, { merge: true });

  console.log("--- Fix Complete. Event updated with Saturday/Sunday dates and official Zoom link. ---");
  process.exit(0);
}

fixEventData().catch((err) => {
    console.error(err);
    process.exit(1);
});
