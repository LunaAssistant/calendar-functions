const { CalendarsService } = require("../services/CalendarsService.js");
const { ColorsService } = require("../services/ColorsService.js");
const { TokensService } = require("../services/TokensService.js");

const { CalendarApi } = require("../googleapi/CalendarApi.js");
const { Validator } = require("../validations/Validator.js");
const { accountSchema } = require("../validations/schemas/AccountSchemas");

exports.syncAccount = async (data, context) => {
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
    const colorsService = new ColorsService();

    return await Promise.all([
      calendarsService.syncCalendars(calendar, uid, accountId),
      colorsService.syncColors(calendar, uid, accountId),
    ]).then((result) => {
      return {
        success: true,
        result,
      };
    });
  } catch (error) {
    console.error("Error syncing", error);

    return {
      error: error.message ? error.message : error,
    };
  }
};

exports.generateToken = async (data, context) => {
  const tokensService = new TokensService();
  const { uid, code } = data;

  try {
    return await tokensService.generateToken(uid, code);
  } catch (error) {
    console.log("Error genrating token:", error);
    return error.response.data ? { error: error.response.data } : { error };
  }
};
