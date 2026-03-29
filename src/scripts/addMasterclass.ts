import { config } from "dotenv";
config({ path: ".env.local" });
import { db, admin } from "../lib/firebaseAdmin";

async function addMasterclass() {
  console.log("--- Adding Masterclass Event ---");

  const eventId = "interview-to-offer-letter";
  await db.collection("events").doc(eventId).set({
    title: "Interview to Offer Letter",
    category: "Communication Masterclass",
    description: "The Ultimate Communication Masterclass. Learn how to answer the most commonly asked interview questions with clarity, structure, and confidence.",
    price: 499,
    date: "Thursday, 30th April 2026",
    time: "7:30 PM IST",
    speaker: "Mridu Bhandari",
    seats: 100,
    banner: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=1000",
    zoomLink: "https://us05web.zoom.us/j/123456789?pwd=example",
    meetingId: "123 456 789",
    passcode: "MASTER",
    updatedAt: new Date()
  }, { merge: true });

  console.log("--- Masterclass Event Added ---");
}

addMasterclass().catch(console.error);
