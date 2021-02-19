const admin = require("firebase-admin");
const moment = require("moment");

class EventsRepository {
  saveEvents(uid, events) {
    // Get a new write batch
    var batch = admin.firestore().batch();

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
}

exports.EventsRepository = EventsRepository;
