class UserNotExists extends Error {
    constructor(message) {
        super(message);
        this.name = "UserNotExists";
    }
}

exports.UserNotExists = UserNotExists;
