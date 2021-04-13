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
                        const self = (event.attendees || []).find((attendee) => {
                            return attendee.self === true;
                        })

                        return {
                            ...event,
                            self: self || {
                                self: true,
                                responseStatus: "accepted",
                            }
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

        return calendar.events
            .update({
                calendarId: calendarId ? calendarId : "primary",
                eventId: eventId,
                resource: {
                    ...eventResource,
                    ...data
                },
            })
            .then((response) => {
                console.log("Updated event: ", eventId)
                return response.data;
            }).catch(error => {
                console.error("Error updating event", error)
            });
    }

    getToday(calendar, uid, tz) {
        const start = moment().tz(tz).startOf("day")
        const end = moment().tz(tz).add(1, 'day').startOf("day")

        return this.getEvents(calendar, {
            start: start.format(),
            end: end.format(),
            limit: 50,
            singleEvents: true,
            orderBy: "startTime",
            timeZone: tz,
        }).then((response) => {
            const {events} = response

            return {
                start,
                end,
                events
            }
        })
    }

    async refreshToday(calendar, uid, tz) {
        const eventsRepository = new EventsRepository();
        const {start, end, events} = await this.getToday(calendar, uid, tz)

        eventsRepository.deleteEvents(uid, start.toDate(), end.toDate()).then(() => {
            return eventsRepository.saveEvents(uid, events)
        }).catch((error) => {
            console.error("Error deleting events on refresh", error)
        })

        return events
    }

    getAvailableTime(tz, events) {
        const available = []

        events = events.map((event) => {
            const {start, end} = event

            return {
                start: moment(start.dateTime).tz(tz),
                end: moment(end.dateTime).tz(tz)
            }
        })

        events.unshift({
            start: moment().tz(tz).startOf("day").add(6, "hours"),
            end: moment().tz(tz).startOf("day").add(6, "hours"),
        })

        events.push({
            start: moment().tz(tz).endOf("day").add(-4, "hours"),
            end: moment().tz(tz).endOf("day").add(-4, "hours"),
        })

        let p1 = 0
        let p2 = 1

        while (p2 < events.length) {
            available.push(this.splitTime(tz, {
                start: events[p1].end,
                end: events[p2].start
            }))

            p1 += 1
            p2 += 1
        }

        return available.reduce((acc, val) => [...acc, ...val], [])
    }

    getCurrentEvents(tz, events) {
        const now = moment().tz(tz)
        let p = 0
        let result = null

        while (p < events.length) {
            const event = events[p]
            const startsAt = moment(event.startsAt)
            const endsAt = moment(event.startsAt)

            if (now.isBefore(startsAt)) {
                result = [events[p - 1], undefined, event]
                break
            } else if (now.isBetween(startsAt, endsAt)) {
                result = [events[p - 1], event, events[p + 1]]
                break
            }

            p++
        }

        if (result === null) {
            result = [events[p - 1], undefined, undefined]
        }

        return result
    }

    splitTime(tz, event) {
        const events = []

        if (event.start.minutes() > 0) {
            event.start = event.start.add(1, 'hour')
        }

        const start = event.start.startOf('hour')
        const end = event.end.startOf('hour')

        while (end.isAfter(start)) {
            events.push({
                start: start.format(),
                end: start.add(1, 'hour').format()
            })
        }

        return events
    }
}

exports.EventsService = EventsService;
