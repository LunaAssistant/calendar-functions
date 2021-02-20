const { UsersRepository } = require("../repositories/UsersRepository");

class UserService {
  createUser(uid, data) {
    const userRepository = new UsersRepository();

    return userRepository.createOrUpdateUser(uid, data);
  }

  getUser(uid) {
    const userRepository = new UsersRepository();

    return userRepository.getUser(uid);
  }
}

exports.UserService = UserService;
