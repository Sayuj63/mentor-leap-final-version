const { db, admin } = require("../src/lib/firebaseAdmin");

async function migrateEvents() {
    console.log("Starting migration: googleMeetLink -> zoomLink");
    try {
        const eventsRef = db.collection("events");
        const snapshot = await eventsRef.get();

        if (snapshot.empty) {
            console.log("No events found to migrate.");
            return;
        }

        const batch = db.batch();
        let count = 0;

        snapshot.forEach(doc => {
            const data = doc.data();
            if (data.googleMeetLink !== undefined) {
                console.log(`Migrating event: ${data.title || doc.id}`);
                batch.update(doc.ref, {
                    zoomLink: data.googleMeetLink,
                    googleMeetLink: admin.firestore.FieldValue.delete()
                });
                count++;
            }
        });

        if (count > 0) {
            await batch.commit();
            console.log(`Successfully migrated ${count} events.`);
        } else {
            console.log("No events required migration.");
        }
    } catch (error) {
        console.error("Migration failed:", error);
    }
}

migrateEvents();
