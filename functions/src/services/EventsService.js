const {EventsRepository} = require("./../repositories/EventsRepository.js");
const moment = require("moment-timezone");

class EventsService {
    getEvents(calendar, data) {
        return calendar.events
            .list({
                calendarId: data.calendarName ? data.calendarName : "primary",
                timeMin: data.start,
                timeMax: data.end,
                maxResults: data.limit,
                singleEvents: true,
                orderBy: "startTime",
                timeZone: data.timeZone,
            })
            .then((response) => {
                return response.data.items;
            })
            .then((events) => {
                return {
                    events: events.map((event) => {
                        return {
                            ...event,
                            self: event.attendees
                                ? event.attendees.find((attendee) => {
                                    return attendee.self === true;
                                })
                                : {
                                    self: true,
                                    responseStatus: "accepted",
                                },
                        };
                    }),
                };
            })
            .catch((error) => {
                console.error("Error getting events from API: ", error);
                throw error;
            });
    }

    createEvent(calendar, calendarId = "primary", eventResource) {
        return calendar.events
            .insert({
                calendarId: calendarId,
                resource: eventResource,
            })
            .then((response) => {
                return response.data;
            });
    }

    getEvent(calendar, calendarId = "primary", eventId) {
        return calendar.events
            .get({
                calendarId,
                eventId,
            })
            .then((response) => {
                return response.data;
            });
    }

    async updateEvent(calendar, calendarId = "primary", eventId, data) {
        let eventResource = await this.getEvent(calendar, calendarId, eventId);
        eventResource.colorId = data.colorId;

        return calendar.events
            .update({
                calendarId: calendarId ? calendarId : "primary",
                eventId: eventId,
                resource: eventResource,
            })
            .then((response) => {
                return response.data;
            });
    }

    async refreshToday(calendar, uid, tz) {
        const eventsRepository = new EventsRepository();
        const start = moment().tz(tz).startOf("day")
        const end = moment().tz(tz).endOf("day")

        console.log(moment().tz(tz));

        return Promise.all([
            eventsRepository.deleteEvents(uid, start.toDate(), end.toDate()),
            this.getEvents(calendar, {
                start: start.format(),
                end: end.format(),
                limit: 500,
                singleEvents: true,
                orderBy: "startTime",
                timeZone: tz,
            })
        ]).then((responses) => {
            return eventsRepository.saveEvents(uid, responses[1].events);
        });
    }
}

exports.EventsService = EventsService;
