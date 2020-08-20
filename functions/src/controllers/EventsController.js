const { EventsService } = require("./../services/EventsService.js");
const { CalendarApi } = require("./../googleapi/CalendarApi.js");
const { Validator } = require("./../validations/Validator.js");
const { accountSchema } = require("./../validations/schemas/AccountSchemas");

exports.getEvents = async (data, context) => {
  const validator = new Validator();
  let { validation } = await validator.validate(accountSchema, data);

  if (validation) {
    return { error: validation };
  }

  const { uid, accountId } = data;
  const calendarApi = new CalendarApi();

  try {
    const { calendar } = await calendarApi.getCalendarForAccount(
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
  let { validation } = await validator.validate(accountSchema, data);

  if (validation) {
    return { error: validation };
  }

  const { uid, accountId, calendarName, event } = data;
  const calendarApi = new CalendarApi();

  try {
    const { calendar } = await calendarApi.getCalendarForAccount(
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
  let { validation } = await validator.validate(accountSchema, data);

  if (validation) {
    return { error: validation };
  }

  const { uid, accountId, calendarId, eventId } = data;
  const calendarApi = new CalendarApi();

  try {
    const { calendar } = await calendarApi.getCalendarForAccount(
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
