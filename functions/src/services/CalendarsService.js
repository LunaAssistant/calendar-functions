const {
  AccountCalendarsRepository,
} = require("./../repositories/AccountCalendarsRepository");

class CalendarsService {
  getCalendars(calendar, data) {
    return calendar.calendarList
      .list({
        maxResults: 25,
        pageToken: data.pageToken,
      })
      .then((response) => {
        return response.data;
      });
  }

  async syncCalendars(calendar, uid, accountId) {
    const respository = new AccountCalendarsRepository();

    const response = await calendar.calendarList.list({
      maxResults: 30,
    });

    const calendarPromises = response.data.items.map((item) => {
      return respository.saveCalendar(uid, accountId, item);
    });

    return Promise.all(calendarPromises).catch((error) => {
      console.error("Error saving all calendars: ", error);
    });
  }
}

exports.CalendarsService = CalendarsService;
