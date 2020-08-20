const { CalendarsService } = require("../services/CalendarsService.js");
const { CalendarApi } = require("../googleapi/CalendarApi.js");
const { Validator } = require("../validations/Validator.js");
const { accountSchema } = require("../validations/schemas/AccountSchemas");

exports.getCalendars = async (data, context) => {
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
    const calendarsService = new CalendarsService();

    return await calendarsService.getCalendars(calendar, data);
  } catch (error) {
    console.error("Error getting calendars", error);

    return {
      error: error.message ? error.message : error,
    };
  }
};
