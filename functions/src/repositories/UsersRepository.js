const admin = require("firebase-admin");

class UsersRepository {
  async updateUser(uid, data) {
    const userRef = admin.firestore().collection(`users`).doc(uid);

    const docSnapshot = await userRef.get();

    if (docSnapshot.exists === false) {
      return userRef
        .set(data)
        .then(() => {
          console.log("User document successfully created!");
          return {};
        })
        .catch((error) => {
          console.error("Error creating user document: ", error);
          return error;
        });
    } else {
      return userRef
        .update(data)
        .then(() => {
          console.log("User document successfully updated!");
          return {};
        })
        .catch((error) => {
          console.error("Error updating user document: ", error);
          return error;
        });
    }
  }
}

exports.UsersRepository = UsersRepository;
