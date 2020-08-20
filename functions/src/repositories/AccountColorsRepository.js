const admin = require("firebase-admin");

class AccountColorsRepository {
  updateColors(uid, accountId, colors) {
    return admin
      .firestore()
      .collection(`users/${uid}/calendars`)
      .doc(accountId)
      .update({ colors: colors })
      .catch((error) => {
        console.log("Error saving message in DB", error);
      });
  }
}

exports.AccountColorsRepository = AccountColorsRepository;
