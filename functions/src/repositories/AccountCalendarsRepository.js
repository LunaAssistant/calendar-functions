const admin = require("firebase-admin");

class AccountCalendarsRepository {
  saveCalendar(uid, accountId, calendar) {
    return admin
      .firestore()
      .collection(`users/${uid}/calendars/${accountId}/calendars`)
      .doc(calendar.id)
      .set(calendar);
  }
}

exports.AccountCalendarsRepository = AccountCalendarsRepository;
