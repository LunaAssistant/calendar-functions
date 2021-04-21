const moment = require("moment-timezone");
const {EventsRepository} = require("../repositories/EventsRepository");
const {PrioritiesRepository} = require("../repositories/PrioritiesRepository");
const {EventMapper} = require("../mappers/EventMapper");
const {UserService} = require("./UserService");
const {EventsService} = require("./EventsService");
const {GoalsRepository} = require("../repositories/GoalsRepository");

const prioritiesRepository = new PrioritiesRepository();
const goalsRepository = new GoalsRepository();
const eventsRepository = new EventsRepository();
const eventsService = new EventsService();
const userService = new UserService();
const eventMapper = new EventMapper();

class GoalsService {
    async saveGaols(uid, goals) {
        const {newEvents} = this.getEventsFromGoals(goals)
        const {calendar} = await userService.getCalendar(uid);

        const saveGoals = goalsRepository.saveGaols(uid, goals)
        const createEvents = newEvents.map(event => {
            return eventsService.createEvent(calendar, "primary", {...event, colorId: 5})
        })

        return Promise.all([saveGoals, ...createEvents])
    }

    async prioritize(uid, tz, goals, events) {
        const {eventIds: highIds, newEvents} = this.getEventsFromGoals(goals)

        const {start, end} = this.getTodayDates(tz)
        const eventsMap = await eventsRepository.getEvents(uid, start, end)

        const high = highIds.map(id => {
            return {...eventMapper.mapMomentDates(eventsMap[id]), priority: 5}
        })

        const optimized = events.map(event => {
            return eventMapper.mapMomentDates({priority: event.priority, ...eventsMap[event.id]})
        })

        const {calendar, email} = await userService.getCalendar(uid);

        const saveGoals = goalsRepository.saveGaols(uid, goals)
        const createEvents = newEvents.map(event => {
            return eventsService.createEvent(calendar, "primary", {...event, colorId: 5})
        })
        const updates = [...high, ...optimized].map((event) => {
            const {id, priority} = event
            const attendees = Array.isArray(event.attendees) ? event.attendees : [event.attendees]

            return eventsService.updateEvent(calendar, "primary", id, {
                colorId: priority,
                attendees: [
                    ...attendees, {
                        email: email,
                        responseStatus: priority === 0 ? "declined" : priority >= 3 ? "accepted" : "tentative"
                    }
                ],
            })
        })
        const savePriority = prioritiesRepository.savePriority(uid, this.getPriority(high, newEvents, optimized))

        return Promise.all([saveGoals, ...createEvents, ...updates, savePriority])
    }

    async getToday(uid, tz) {
        const goalsRepository = new GoalsRepository();
        const {start, end} = this.getTodayDates(tz)

        return await goalsRepository.getGoals(uid, start, end)
    }

    async calculate(uid, goals, events, tz) {
        const {eventIds: highIds, newEvents} = this.getEventsFromGoals(goals)

        const {start, end} = this.getTodayDates(tz)
        const eventsMap = await eventsRepository.getEvents(uid, start, end)

        const high = highIds.map(id => {
            return eventMapper.mapMomentDates(eventsMap[id])
        })

        const optimized = events.map(event => {
            return eventMapper.mapMomentDates(eventsMap[event.id])
        })

        const {token, priority} = await goalsRepository.generateToken(uid, this.getPriority(high, newEvents, optimized))

        return {
            token, priority,
        }
    }

    getPriority(high, newEvents, optimized) {
        const highMinutes = [...high, ...newEvents].map(event => event.minutes)
        const optimizedMinutes = optimized.map(event => event.minutes)

        return {
            goalEvents: highMinutes.length,
            goalMinutes: highMinutes.length > 0 ? highMinutes.reduce((acc, event) => {
                return acc + event
            }) : 0,
            optimizedMinutes: optimizedMinutes.length > 0 ? optimizedMinutes.reduce((acc, event) => {
                return acc + event
            }) : 0,
        }
    }

    async validateToken(userUid, token) {
        const {uid, expiredAt} = await goalsRepository.getGoalToken(token)

        if (expiredAt !== null || userUid !== uid) {
            return false
        }

        return goalsRepository.expireToken(token).then(() => {
            return true
        })
    }

    getEventsFromGoals(goals) {
        let eventIds = []
        let newEvents = []

        goals.forEach((goal) => {
            goal.events.forEach((event) => {
                if (event.id && event.id !== '') {
                    eventIds.push(event.id)
                } else {
                    newEvents.push(eventMapper.mapMomentDates({
                        ...event,
                        summary: goal.title,
                        start: {dateTime: event.startTime},
                        end: {dateTime: event.endTime}
                    }))
                }
            })
        })

        return {
            eventIds,
            newEvents
        }
    }

    getTodayDates(tz) {
        return {
            start: moment().tz(tz).startOf("day"),
            end: moment().tz(tz).endOf("day")
        }
    }
}

exports.GoalsService = GoalsService;
