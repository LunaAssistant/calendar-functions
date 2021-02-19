const { EventsService } = require("./EventsService.js");

var moment = require("moment-timezone");
var _ = require("lodash");
const days = {
  monday: 0,
  tuesday: 1,
  wednesday: 2,
  thursday: 3,
  friday: 4,
  saturday: 5,
  sunday: 6,
};

class FocusEventsService {
  cleanEvent(event, timezone) {
    let {
      id,
      status,
      summary,
      start,
      end,
      attendees,
      hangoutLink,
      description,
      self,
      organizer,
      creator,
    } = event;

    let startMoment = moment(start.dateTime).tz(timezone);

    return {
      id,
      status,
      summary,
      attendees: attendees ? attendees : [],
      hangoutLink,
      description,
      start: startMoment,
      self,
      organizer,
      creator,
      minutes: moment(end.dateTime).tz(timezone).diff(startMoment, "minutes"),
    };
  }

  splitEventByTime(event, minutesToSplit, timezone) {
    let newEvents = [];

    while (event.start.minutes() + event.minutes > minutesToSplit) {
      let eventMinutes = minutesToSplit - event.start.minutes();

      newEvents.push({
        ...event,
        start: moment({ ...event.start }).tz(timezone),
        minutes: eventMinutes,
      });

      event.minutes -= eventMinutes;
      event.start.add(eventMinutes, "minutes");
    }

    newEvents.push({ ...event });

    return newEvents;
  }

  sortEvents(eventA, eventB) {
    let diff = eventA.yPosition - eventB.yPosition;

    if (diff === 0) {
      diff = eventA.xPosition - eventB.xPosition;
    }

    if (diff === 0) {
      diff = eventB.height - eventA.height;
    }

    return diff;
  }

  calculateHeight(event, minutes) {
    return Math.round(event.minutes / minutes);
  }

  calculateXPosition(event, minutes) {
    if (minutes === 15) {
      return Math.round(event.start.minutes() / 15);
    }

    return Math.round((event.start.hours() * 60 + event.start.minutes()) / 15);
  }

  calculateSharedPosition(events) {
    let pointerA = 0;
    let pointerB = 1;
    let eventPosition = 0;

    // Pointer strategic
    while (pointerB <= events.length) {
      if (
        pointerB in events &&
        // verifiying if both events are in the same column time (yPosition)
        // and if eventB is starting inside of eventA
        events[pointerA].yPosition === events[pointerB].yPosition &&
        events[pointerB].xRange[0] >= events[pointerA].xRange[0] &&
        events[pointerB].xRange[0] < events[pointerA].xRange[1]
      ) {
        if (events[pointerA].isSharedPosition !== true) {
          events[pointerA].isSharedPosition = true;
          events[pointerA].eventPosition = eventPosition;
          eventPosition += 1;
        }

        if (events[pointerB].isSharedPosition !== true) {
          events[pointerB].isSharedPosition = true;
          events[pointerB].eventPosition = eventPosition;
          eventPosition += 1;
        }
      } else if (
        events[pointerA].eventPosition === 1 &&
        pointerB - pointerA === 0
      ) {
        events[pointerA].eventPosition = 3;
      } else if (events[pointerA].isSharedPosition !== true) {
        eventPosition = 0;
        events[pointerA].isSharedPosition = false;
        events[pointerA].eventPosition = eventPosition;
      }

      console.log(
        "eventA",
        events[pointerA].summary,
        events[pointerA].isSharedPosition,
        events[pointerA].eventPosition,
        events[pointerA].xRange
      );
      if (pointerB in events) {
        console.log(
          "eventB",
          events[pointerB].summary,
          events[pointerB].isSharedPosition,
          events[pointerB].eventPosition,
          events[pointerB].xRange
        );
      }

      console.log("----");

      if (
        // Verify if the eventB is in a new column (yPosition)
        pointerB in events &&
        events[pointerA].yPosition !== events[pointerB].yPosition
      ) {
        eventPosition = 0;
      }

      if (
        pointerB in events &&
        (events[pointerA].xRange[1] <= events[pointerB].xRange[1] ||
          events[pointerA].yPosition !== events[pointerB].yPosition)
      ) {
        pointerA += 1;
        pointerB = pointerA + 1;
      } else {
        pointerB += 1;
      }
    }

    return new Map(
      Object.entries(
        _.groupBy(events, (event) => {
          return event.yPosition;
        })
      ).map((subEvents) => {
        subEvents[1] = _.groupBy(subEvents[1], (event) => {
          return event.xPosition;
        });

        return subEvents;
      })
    );
  }

  async getEvents(calendar, data) {
    const flatMap10 = (f, xs) => xs.reduce((acc, x) => acc.concat(f(x)), []);
    const eventsService = new EventsService();
    const response = await eventsService.getEvents(calendar, data);

    let mappedEvents = response.events.map((event) => {
      return this.cleanEvent(event, data.timeZone);
    });

    mappedEvents = flatMap10((event) => {
      return this.splitEventByTime(
        event,
        data.maxMinutesByColumn,
        data.timeZone
      );
    }, mappedEvents);

    mappedEvents = mappedEvents
      .map((event) => {
        const xPosition = this.calculateXPosition(
          event,
          data.eventHeightMinutes
        );
        const height = this.calculateHeight(event, 15);

        return {
          ...event,
          start: event.start.format(),
          height,
          yPosition:
            data.maxMinutesByColumn === 60
              ? event.start.hours() - 1
              : days[event.start.format("dddd").toLowerCase()],
          xPosition,
          xRange: [xPosition, xPosition + height],
          isSharedPosition: undefined,
          eventPosition: undefined,
        };
      })
      .sort((a, b) => {
        return this.sortEvents(a, b);
      });

    return this.calculateSharedPosition(mappedEvents);
  }
}

exports.FocusEventsService = FocusEventsService;
