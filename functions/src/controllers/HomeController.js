const {CalendarsService} = require("../services/CalendarsService.js");
const {UserService} = require("../services/UserService.js");
const {ColorsService} = require("../services/ColorsService.js");
const {TokensService} = require("../services/TokensService.js");

const {CalendarApi} = require("../googleapi/CalendarApi.js");
const {Validator} = require("../validations/Validator.js");
const {accountSchema} = require("../validations/schemas/AccountSchemas");
const functions = require("firebase-functions");
const {GoalsService} = require("../services/GoalsService");
const {EventsService} = require("../services/EventsService");
const {EventMapper} = require("../mappers/EventMapper");

const {UserNotExists} = require("../errors/UserNotExists");


exports.getHome = async (data, context) => {
    const eventsService = new EventsService();
    const userService = new UserService();
    const eventMapper = new EventMapper();
    const goalsService = new GoalsService()

    const {uid, timezone} = data;

    try {
        const {calendar} = await userService.getCalendar(uid);

        return Promise.all([
            eventsService.refreshToday(calendar, uid, timezone).then((events) =>
                events.map(e => eventMapper.mapDates(e))
            ), goalsService.getToday(uid, timezone)
        ]).then((promises) => {
                const [events, goals] = promises
                const availableTime = eventsService.getAvailableTime(timezone, events)
                const currentEvents = eventsService.getCurrentEvents(timezone, events).map((e) => eventMapper.mapCurrentEvent(e))

                return {
                    events,
                    currentEvents,
                    availableTime,
                    goals
                }
            }
        )
    } catch (error) {
        if (error instanceof UserNotExists) {
            throw new functions.https.HttpsError(
                "invalid-argument",
                error.message
            )
        }

        throw new functions.https.HttpsError(
            "internal",
            error.message ? error.message : error,
        );
    }
};

