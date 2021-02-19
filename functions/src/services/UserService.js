const { UsersRepository } = require("../repositories/UsersRepository");

class UserService {
  createUser(uid, data) {
    const userRepository = new UsersRepository();

    return userRepository.updateUser(uid, data);
  }
}

exports.UserService = UserService;
