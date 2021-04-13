const {UserService} = require("../services/UserService");
const { ColorsService } = require("../services/ColorsService");
const { CalendarApi } = require("../googleapi/CalendarApi");
const { Validator } = require("../validations/Validator");
const { accountSchema } = require("../validations/schemas/AccountSchemas");

exports.getColors = async (data, context) => {
  const validator = new Validator();
  const userService = new UserService();
  let { validation } = await validator.validate(accountSchema, data);

  if (validation) {
    return { error: validation };
  }

  const { uid } = data;
  const calendarApi = new CalendarApi();

  try {
    const {calendar} = await userService.getUser(uid).then(async (user) => {
      const {accountId} = user;

      return await calendarApi.getCalendarForAccount(uid, accountId);
    });

    const colorsService = new ColorsService();

    return await colorsService.getColors(calendar, data);
  } catch (error) {
    console.error("Error getting colors", error);

    return {
      error: error.message ? error.message : error,
    };
  }
};
