const {EventsService} = require("./../services/EventsService.js");
const {UserService} = require("./../services/UserService.js");
const {EventsRepository} = require("./../repositories/EventsRepository.js");
const {FocusEventsService} = require("./../services/FocusEventsService.js");
const {CalendarApi} = require("./../googleapi/CalendarApi.js");
const {Validator} = require("./../validations/Validator.js");
const {accountSchema} = require("./../validations/schemas/AccountSchemas");
const functions = require("firebase-functions");
const moment = require("moment-timezone");
const {EventMapper} = require("../mappers/EventMapper");
const {UserNotExists} = require("../errors/UserNotExists");

exports.getFocusEvents = async (data, context) => {
    const validator = new Validator();
    let {validation} = await validator.validate(accountSchema, data);

    if (validation) {
        throw new functions.https.HttpsError(
            "invalid-argument",
            "Validation error",
            {
                error: validation,
            }
        );
    }

    const {uid, accountId} = data;
    const calendarApi = new CalendarApi();

    try {
        const {calendar} = await calendarApi.getCalendarForAccount(
            uid,
            accountId
        );
        const service = new FocusEventsService();
        let eventsMap = await service.getEvents(calendar, data);
        let object = {};

        eventsMap.forEach((value, key) => {
            var keys = key.split("."),
                last = keys.pop();
            keys.reduce((r, a) => (r[a] = r[a] || {}), object)[last] = value;
        });

        return {
            events: object,
        };
    } catch (error) {
        console.error("Error getting calendar events", error);

        throw new functions.https.HttpsError("internal", "Internal error", {
            error: error.message ? error.message : error,
        });
    }
};

exports.getEvents = async (data, context) => {
    const validator = new Validator();
    let {validation} = await validator.validate(accountSchema, data);

    if (validation) {
        return {error: validation};
    }

    const {uid, accountId} = data;
    const calendarApi = new CalendarApi();

    try {
        const {calendar} = await calendarApi.getCalendarForAccount(
            uid,
            accountId
        );
        const eventsService = new EventsService();

        return await eventsService.getEvents(calendar, data);
    } catch (error) {
        console.error("Error getting calendar events", error);

        return {
            error: error.message ? error.message : error,
        };
    }
};

exports.createEvent = async (data, context) => {
    const validator = new Validator();
    let {validation} = await validator.validate(accountSchema, data);

    if (validation) {
        return {error: validation};
    }

    const {uid, accountId, calendarName, event} = data;
    const calendarApi = new CalendarApi();

    try {
        const {calendar} = await calendarApi.getCalendarForAccount(
            uid,
            accountId
        );
        const eventsService = new EventsService();

        return await eventsService.createEvent(calendar, calendarName, event);
    } catch (error) {
        console.error("Error creating event", error);

        return {
            error: error.message ? error.message : error,
        };
    }
};

exports.updateEvent = async (data, context) => {
    const validator = new Validator();
    let {validation} = await validator.validate(accountSchema, data);

    if (validation) {
        return {error: validation};
    }

    const {uid, accountId, calendarId, eventId} = data;
    const calendarApi = new CalendarApi();

    try {
        const {calendar} = await calendarApi.getCalendarForAccount(
            uid,
            accountId
        );
        const eventsService = new EventsService();

        return await eventsService.updateEvent(calendar, calendarId, eventId, data);
    } catch (error) {
        console.error("Error creating event", error);

        return {
            error: error.message ? error.message : error,
        };
    }
};

exports.syncFirstEvents = async (change, context) => {
    console.log("syncFirstEvents....");

    const {accountId: oldAccountId} = change.before.data();
    const {accountId} = change.after.data();
    const uid = context.params.uid;

    if (accountId && accountId !== oldAccountId) {
        console.log("sync...", {oldAccountId}, {accountId}, uid);

        const calendarApi = new CalendarApi();

        try {
            const {calendar} = await calendarApi.getCalendarForAccount(
                uid,
                accountId
            );
            const eventsService = new EventsService();
            const eventsRepository = new EventsRepository();

            return eventsService
                .getEvents(calendar, {
                    start: moment().subtract(3, "days").format(),
                    end: moment().add(3, "days").format(),
                    limit: 500,
                    singleEvents: true,
                    orderBy: "startTime",
                    timeZone: "America/Mexico_City",
                })
                .then((response) => {
                    return eventsRepository.saveEvents(uid, response.events);
                });
        } catch (error) {
            console.error("Error getting calendar events", error);

            return {
                error: error.message ? error.message : error,
            };
        }
    }
};

exports.refreshToday = async (data, context) => {
    const eventsService = new EventsService();
    const userService = new UserService();
    const eventMapper = new EventMapper();
    const calendarApi = new CalendarApi();

    const {uid, timezone} = data;

    try {
        const {calendar} = await userService.getUser(uid).then(async (user) => {
            const {accountId} = user;

            return await calendarApi.getCalendarForAccount(uid, accountId);
        });

        const events = await eventsService.refreshToday(calendar, uid, timezone);

        return {
            events: events.map(e => eventMapper.mapDates(e)),
            available_time: eventsService.getAvailableTime(timezone, events)
        }
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
