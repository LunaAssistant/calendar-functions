const admin = require("firebase-admin");

exports.test = (request, response) => {
  admin
    .firestore()
    .collection(`tests`)
    .add({
      test: "Ok",
    })
    .then(() => {
      return response.send({
        success: "ok",
      });
    })
    .catch((error) => {
      console.error("Error saving test in DB", error);

      response.status(500).send({
        success: "fail",
        error,
      });
    });
};
