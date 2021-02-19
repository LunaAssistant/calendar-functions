const eventsController = require("./src/controllers/EventsController");
const colorsController = require("./src/controllers/ColorsController");
const calendarsController = require("./src/controllers/CalendarsController");
const accountsController = require("./src/controllers/AccountsController");
const whatsappController = require("./src/controllers/WhatsappController");
const onboardingWebHookController = require("./src/controllers/OnboardingWebHookController");
const testEmulatorController = require("./src/controllers/TestEmulatorController");

require("dotenv").config();

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const cors = require("cors")({ origin: true });

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
exports.getEvents = functions.https.onCall(eventsController.getEvents);
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
