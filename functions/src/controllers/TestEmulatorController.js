const admin = require("firebase-admin");
var moment = require("moment"); // require
const { UserService } = require("../services/UserService.js");

exports.test = async (request, response) => {
  const userService = new UserService();

  const r = await userService.createUser("uid998", {
    email: "pepe@juarez.com",
    uid: "udadfs",
    pepe: {
      year: 220,
      day: "saturday",
    },
  });

  return response.send(r);

  /*
  console.log(
    "moment-now",
    moment().subtract(3, "days").format(),
    moment().add(3, "days").format(),
    moment("2021-01-22T17:00:00-06:00").format()
  );

  return admin
    .firestore()
    .collection(`tests`)
    .add({
      test: "Ok",
      v1: moment("2021-01-22T17:00:00-06:00"),
      v2: moment("2021-01-22T17:00:00-06:00").format(),
    })
    .then(() => {
      return response.send({
        success: "ok",
        moment: moment("2021-01-22T17:00:00-06:00"),
        from: moment().subtract(3, "days").format(),
        to: moment().add(3, "days").format(),
      });
    })
    .catch((error) => {
      console.error("Error saving test in DB", error);

      response.status(500).send({
        success: "fail",
        error,
      });
    });
    */
};
