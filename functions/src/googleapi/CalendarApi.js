const { google } = require("googleapis");

const { GoogleAuth } = require("./GoogleAuth.js");

class CalendarApi {
  constructor() {}

  async getCalendarForAccount(uid, accountId) {
    const googleAuth = new GoogleAuth();
    const oauth2Client = await googleAuth.getAuthClientForAccount(
      uid,
      accountId
    );

    return {
      calendar: google.calendar({
        version: "v3",
        auth: oauth2Client,
      }),
    };
  }
}

exports.CalendarApi = CalendarApi;
