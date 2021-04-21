const {UserService} = require("../services/UserService.js");
const functions = require("firebase-functions");
const {PrioritiesRepository} = require("../repositories/PrioritiesRepository");
const {GoalsService} = require("../services/GoalsService");
const {EventsService} = require("../services/EventsService");
const {EventMapper} = require("../mappers/EventMapper");

const {UserNotExists} = require("../errors/UserNotExists");
const moment = require("moment-timezone");

const eventsService = new EventsService();
const userService = new UserService();
const eventMapper = new EventMapper();
const goalsService = new GoalsService();
const prioritiesRepository = new PrioritiesRepository()

exports.getHome = async (data, context) => {
    const {uid, timezone} = data;

    try {
        const {calendar} = await userService.getCalendar(uid);

        return await Promise.all([
            eventsService.refreshToday(calendar, uid, timezone).then((events) =>
                events.map(e => eventMapper.mapDates(e))
            ), goalsService.getToday(uid, timezone),
            prioritiesRepository.getPriority(uid, moment().tz(timezone).startOf("day"), moment().tz(timezone).endOf("day"))
        ]).then((promises) => {
                const [events, goals, priority] = promises
                const currentEvents = eventsService.getCurrentEvents(timezone, events).map((e) => eventMapper.mapCurrentEvent(e))

                return {
                    currentEvents,
                    goals,
                    priority: priority || {
                        goalEvents: 0,
                        goalMinutes: 0,
                        optimizedMinutes: 0,
                    }
                }
            }
        )
    } catch (error) {
        console.error("Error getting home: ", error.stack)

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

