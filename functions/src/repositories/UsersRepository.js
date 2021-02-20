const admin = require("firebase-admin");
const {UserNotExists} = require("../errors/UserNotExists")

class UsersRepository {
    async getUser(uid) {
        return getUserDocRef(uid)
            .get()
            .then((docSnapshot) => {
                if (!docSnapshot.exists) {
                    throw new UserNotExists(`Account not exists for uid ${uid}`);
                }

                return docSnapshot.data();
            })
    }

    async createOrUpdateUser(uid, data) {
        const userRef = getUserDocRef(uid);

        return userRef.get().then((docSnapshot) => {
            if (docSnapshot.exists) {
                return update(userRef, data);
            }
            return create(userRef, data);
        });
    }
}

function create(userRef, data) {
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
}

function update(userRef, data) {
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

function getUserDocRef(uid) {
    return admin.firestore().collection(`users`).doc(uid);
}

exports.UsersRepository = UsersRepository;
