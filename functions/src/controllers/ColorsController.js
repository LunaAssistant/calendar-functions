const { ColorsService } = require("../services/ColorsService");
const { CalendarApi } = require("../googleapi/CalendarApi");
const { Validator } = require("../validations/Validator");
const { accountSchema } = require("../validations/schemas/AccountSchemas");

exports.getColors = async (data, context) => {
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
    const colorsService = new ColorsService();

    return await colorsService.getColors(calendar, data);
  } catch (error) {
    console.error("Error getting colors", error);

    return {
      error: error.message ? error.message : error,
    };
  }
};
