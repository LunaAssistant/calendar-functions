const moment = require("moment-timezone");

class EventMapper {
    mapDates(e) {
        return {
            ...e,
            startsAt: moment(e.start.dateTime).format(),
            endsAt: moment(e.end.dateTime).format(),
        }
    }

    mapMomentDates(e) {
        const startsAt = moment(e.start.dateTime)
        const endsAt = moment(e.end.dateTime)

        return {
            ...e,
            startsAt: startsAt.format(),
            endsAt: endsAt.format(),
            minutes: endsAt.diff(startsAt, "minutes")
        }
    }

    mapCurrentEvent(e) {
        const {summary} = e ? e : {summary: "no event"}

        return {
            summary
        }
    }
}

exports.EventMapper = EventMapper;
