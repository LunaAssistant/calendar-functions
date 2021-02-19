const admin = require("firebase-admin");

class AccountTokensRepository {
  addAccount(uid, account, tokens) {
    return admin
      .firestore()
      .collection(`users/${uid}/calendars`)
      .add({
        tokens,
        account,
        userUid: uid,
        createdAt: new Date(),
      })
      .then((docRef) => {
        const { id } = docRef;

        return {
          ...account,
          docId: id,
          createdAt: new Date(),
          type: null,
        };
      });
  }

  getTokens(uid, acccontId) {
    return admin
      .firestore()
      .collection(`users/${uid}/calendars`)
      .doc(acccontId)
      .get()
      .then((doc) => {
        if (!doc.exists) {
          throw new Error(`Account ${acccontId} not exists for uid ${uid}`);
        }

        return {
          tokens: doc.data().tokens,
          accountRef: doc.ref,
        };
      });
  }

  updateTokens(accountRef, tokens) {
    const { access_token, expiry_date } = tokens;

    return accountRef
      .update({
        "tokens.access_token": access_token,
        "tokens.expiry_date": expiry_date,
      })
      .then((result) => {
        console.log("Success updating tokens", result);
        return result;
      });
  }
}

exports.AccountTokensRepository = AccountTokensRepository;
