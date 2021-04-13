const eventsController = require("./src/controllers/EventsController");
const goalsController = require("./src/controllers/GoalsController");
const colorsController = require("./src/controllers/ColorsController");
const calendarsController = require("./src/controllers/CalendarsController");
const accountsController = require("./src/controllers/AccountsController");
const whatsappController = require("./src/controllers/WhatsappController");
const onboardingWebHookController = require("./src/controllers/OnboardingWebHookController");
const testEmulatorController = require("./src/controllers/TestEmulatorController");
const homeController = require("./src/controllers/HomeController");

require("dotenv").config();

const functions = require("firebase-functions");
const admin = require("firebase-admin");

const cors = require("cors")({origin: true});

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
    credential: admin.credential.cert(require("./serviceAccount.json")),
});

exports.generateToken = functions.https.onCall(
    accountsController.generateToken
);

exports.syncAccount = functions.https.onCall(accountsController.syncAccount);

exports.getFocusEvents = functions.https.onCall(
    eventsController.getFocusEvents
);

exports.createEvent = functions.https.onCall(eventsController.createEvent);
exports.updateEvent = functions.https.onCall(eventsController.updateEvent);

exports.getCalendars = functions.https.onCall(calendarsController.getCalendars);
exports.getColors = functions.https.onCall(colorsController.getColors);

exports.sendMessage = functions.https.onRequest(whatsappController.sendMessage);
exports.whatsappWebHooks = functions.https.onRequest(
    whatsappController.webHook
);

exports.onboardingWebHook = functions.https.onRequest(
    onboardingWebHookController.webHook
);

exports.testHttp = functions.https.onRequest(testEmulatorController.test);

exports.updateUser = functions.firestore
    .document("users/{uid}")
    .onUpdate((change, context) => {
        return eventsController.syncFirstEvents(change, context);
    });

exports.saveUserData = functions.auth.user().onCreate((user) => {
    return accountsController.createUser(user.uid, user);
});

// V1
exports.refreshToday = functions.https.onCall(eventsController.refreshToday);
exports.getTodayGoals = functions.https.onCall(goalsController.getToday);
exports.saveGoals = functions.https.onCall(goalsController.saveGoals);

// V2
exports.getHome = functions.https.onCall(homeController.getHome)
exports.calculate = functions.https.onCall(goalsController.calculate)
exports.getEvents = functions.https.onCall(eventsController.getEvents);
exports.prioritize = functions.https.onCall(goalsController.prioritize)
