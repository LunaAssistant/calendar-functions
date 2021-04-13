const {UsersRepository} = require("../repositories/UsersRepository");
const {CalendarApi} = require("./../googleapi/CalendarApi.js");

class UserService {
    createUser(uid, data) {
        const userRepository = new UsersRepository();

        return userRepository.createOrUpdateUser(uid, data);
    }

    getUser(uid) {
        const userRepository = new UsersRepository();

        return userRepository.getUser(uid);
    }

    async getCalendar(uid) {
        const calendarApi = new CalendarApi();

        return this.getUser(uid).then(async (user) => {
            const {accountId, email} = user;
            const {calendar} = await calendarApi.getCalendarForAccount(uid, accountId);

            return {
                calendar,
                email
            }
        });
    }
}

exports.UserService = UserService;
