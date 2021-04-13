const {GoalsService} = require("./../services/GoalsService.js");
const {Validator} = require("./../validations/Validator.js");
const {userAndTimezoneSchema} = require("./../validations/schemas/UserSchemas");
const functions = require("firebase-functions");

const goalsService = new GoalsService()

exports.getToday = async (data, context) => {
    // console.log(context.auth)
    const validator = new Validator();
    let {validation} = await validator.validate(userAndTimezoneSchema, data);

    if (validation) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Validation error",
            {
                error: validation,
            }
        );
    }

    const {uid, timezone} = data;

    try {
        const goalsService = new GoalsService()

        return goalsService.getToday(uid, timezone)
    } catch (error) {
        console.error("Error getting goals", error);

        throw new functions.https.HttpsError("internal", "Internal error", {
            error: error.message ? error.message : error,
        });
    }
};

exports.saveGoals = async (data, context) => {
    const {uid, goals} = data;

    try {
        return goalsService.saveGaols(uid, goals || [])
    } catch (error) {
        console.error("Error saving goals", error);

        throw new functions.https.HttpsError("internal", "Internal error", {
            error: error.message ? error.message : error,
        });
    }
};

exports.prioritize = async (data, context) => {
    const {uid, timezone, token, goals, events} = data;

    if (!token) {
        throw new functions.https.HttpsError("invalid-argument", "Validation error", {
            error: "token is required"
        });
    }

    const valid = true //await goalsService.validateToken(uid, token)

    if (valid === false) {
        throw new functions.https.HttpsError("permission-denied", "Invalid goals token", {
            error: "token is expired"
        });
    }

    try {
        return goalsService.prioritize(uid, timezone, goals || [], events || [], timezone)
    } catch (error) {
        console.error("Error prioritizing", error);

        throw new functions.https.HttpsError("internal", "Internal error", {
            error: error.message ? error.message : error,
        })
    }
}

exports.calculate = async (data, context) => {
    const {uid, timezone, goals, events} = data;

    try {
        return goalsService.calculate(uid, goals || [], events || [], timezone)
    } catch (error) {
        throw new functions.https.HttpsError("internal", "Internal error", {
            error: error.message ? error.message : error,
        });
    }
};
