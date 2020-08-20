const admin = require("firebase-admin");

class AccountTokensRepository {
  addAccount(uid, account, tokens) {
    return admin.firestore().collection(`users/${uid}/calendars`).add({
      tokens,
      account,
      userUid: uid,
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
          throw new Error("Account not exists");
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
