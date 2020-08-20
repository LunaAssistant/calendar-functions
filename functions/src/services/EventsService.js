class EventsService {
  getEvents(calendar, data) {
    let date = new Date();
    date.setDate(date.getDate() - 5);

    return calendar.events
      .list({
        calendarId: data.calendarName ? data.calendarName : "primary",
        timeMin: date.toISOString(),
        maxResults: 100,
        singleEvents: true,
        orderBy: "startTime",
      })
      .then((response) => {
        return {
          events: response.data.items,
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
}

exports.EventsService = EventsService;
