const admin = require("firebase-admin");
const moment = require("moment-timezone");

class GoalsRepository {
    async saveGaols(uid, goals) {
        const batch = admin.firestore().batch();

        goals.forEach((goal) => {
            const goalRef = admin
                .firestore()
                .collection(`users/${uid}/goals`)
                .doc()

            goal.createdAt = moment().toDate()

            batch.set(goalRef, goal);
        });

        // Commit the batch
        return batch.commit().then(() => {
            console.log("Created goals: ", goals.length);
            return true;
        });
    }

    async getGoals(uid, start, end) {
        return admin
            .firestore().collection(`users/${uid}/goals`)
            .where("createdAt", ">=", start)
            .where("createdAt", "<=", end)
            .get()
            .then((querySnapshot) => {
                const goals = []

                querySnapshot.forEach((doc) => {
                    goals.push(doc.data())
                });

                return goals
            })
    }

    async generateToken(uid, priority) {
        return admin.firestore().collection(`tokens`).add({
            uid,
            priority,
            createdAt: new Date(),
            expiredAt: null
        }).then(docRef => {
            console.log("Token generated for:", uid, docRef.id)

            return {token: docRef.id, priority}
        })
    }

    async getGoalToken(token) {
        const docRef = admin.firestore().collection(`tokens`).doc(token)

        return docRef.get().then((doc) => {
            if (doc.exists) {
                console.log("Document data:", doc.data());
                return doc.data()
            } else {
                // doc.data() will be undefined in this case
                console.log("No such token!");
                return null
            }
        }).catch((error) => {
            console.log("Error getting token:", error);
        });
    }

    async expireToken(token) {
        const docRef = admin.firestore().collection(`tokens`).doc(token)

        return docRef.set({
            expiredAt: new Date()
        }, {merge: true});
    }
}

exports.GoalsRepository = GoalsRepository;
