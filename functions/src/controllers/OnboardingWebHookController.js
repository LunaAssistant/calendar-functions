const {
  OnboardingFormsRepository,
} = require("./../repositories/OnboardingFormsRepository");

exports.webHook = async (request, response) => {
  console.log("Saving form answers", request.body);
  const repository = new OnboardingFormsRepository();

  repository
    .saveAnswers(request.body)
    .then(() =>
      response.send({
        status: "OK",
      })
    )
    .catch((error) => {
      console.error("Error saving form answers", error);
      response.send(500).send(error);
    });
};
