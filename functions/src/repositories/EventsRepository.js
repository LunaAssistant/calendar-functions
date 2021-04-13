const admin = require("firebase-admin");
const moment = require("moment-timezone");

class EventsRepository {
    saveEvents(uid, events) {
        // Get a new write batch
        const batch = admin.firestore().batch();

        events.forEach((event) => {
            const eventRef = admin
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
        }).catch((error) => {
            console.error("Error saving events: ", error)
            throw  error
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

    async getEvents(uid, start, end) {
        return admin
            .firestore().collection(`users/${uid}/events`)
            .where("startsAt", ">=", start)
            .where("startsAt", "<=", end)
            .get()
            .then((querySnapshot) => {
                const events = {}

                querySnapshot.forEach((doc) => {
                    events[doc.id] = doc.data()
                });

                return events
            })
    }
}

exports.EventsRepository = EventsRepository;
