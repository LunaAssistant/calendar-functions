const admin = require("firebase-admin");
const moment = require("moment-timezone");

class EventsRepository {
    saveEvents(uid, events) {
        // Get a new write batch
        const batch = admin.firestore().batch();

        events.forEach((event) => {
            var eventRef = admin
                .firestore()
                .collection(`users/${uid}/events`)
                .doc(event.id);

            event.startsAt = moment(event.start.dateTime);
            event.endsAt = moment(event.end.dateTime);

            batch.set(eventRef, event);
        });

        // Commit the batch
        return batch.commit().then(() => {
            console.log("Updated events: ", events.length);
            return true;
        });
    }

    async deleteEvents(uid, start, end) {
        const batch = await admin
            .firestore().collection(`users/${uid}/events`)
            .where("startsAt", ">=", start)
            .where("startsAt", "<=", end)
            .get()
            .then((querySnapshot) => {
                const batch = admin.firestore().batch();

                querySnapshot.forEach((doc) => {
                    batch.delete(doc.ref);
                });

                return batch
            })

        return batch.commit().catch((error) => {
            console.error("Error removing documents: ", error);
        });
    }
}

exports.EventsRepository = EventsRepository;
