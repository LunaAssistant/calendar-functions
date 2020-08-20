const eventsController = require("./src/controllers/EventsController");
const colorsController = require("./src/controllers/ColorsController");
const calendarsController = require("./src/controllers/CalendarsController");
const accountsController = require("./src/controllers/AccountsController");
const whatsappController = require("./src/controllers/WhatsappController");
const testEmulatorController = require("./src/controllers/TestEmulatorController");

require("dotenv").config();

const functions = require("firebase-functions");
const admin = require("firebase-admin");

// Initialize the app with a service account, granting admin privileges
admin.initializeApp({
  credential: admin.credential.cert(require("./serviceAccount.json")),
});

exports.generateToken = functions.https.onCall(
  accountsController.generateToken
);
exports.syncAccount = functions.https.onCall(accountsController.syncAccount);

exports.getEvents = functions.https.onCall(eventsController.getEvents);
exports.createEvent = functions.https.onCall(eventsController.createEvent);
exports.updateEvent = functions.https.onCall(eventsController.updateEvent);

exports.getCalendars = functions.https.onCall(calendarsController.getCalendars);
exports.getColors = functions.https.onCall(colorsController.getColors);

exports.sendMessage = functions.https.onRequest(whatsappController.sendMessage);
exports.whatsappWebHooks = functions.https.onRequest(
  whatsappController.webHook
);

exports.testHttp = functions.https.onRequest(testEmulatorController.test);
