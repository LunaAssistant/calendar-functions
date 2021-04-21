const admin = require("firebase-admin");
const moment = require("moment-timezone");

class PrioritiesRepository {
    async savePriority(uid, priority) {
        return admin
            .firestore()
            .collection(`users/${uid}/priorities`)
            .add({...priority, createdAt: moment().toDate()})
            .then((docRef) => {
                const {id} = docRef;

                return id
            })
    }

    async getPriority(uid, start, end) {
        return admin
            .firestore().collection(`users/${uid}/priorities`)
            .where("createdAt", ">=", start)
            .where("createdAt", "<=", end)
            .orderBy("createdAt", "desc")
            .limit(1)
            .get()
            .then((querySnapshot) => {
                const priorities = []

                querySnapshot.forEach((doc) => {
                    priorities.push(doc.data())
                });

                return priorities.length > 0 ? priorities.pop() : null
            })
    }
}

exports.PrioritiesRepository = PrioritiesRepository;
