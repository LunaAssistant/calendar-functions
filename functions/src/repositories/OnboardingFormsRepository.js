const admin = require("firebase-admin");

class OnboardingFormsRepository {
  saveAnswers(formAnswers) {
    return admin
      .firestore()
      .collection(`onboarding_answers`)
      .add(formAnswers)
      .catch((error) => {
        console.log("Error saving answers status in DB", error);
      });
  }
}

exports.OnboardingFormsRepository = OnboardingFormsRepository;
