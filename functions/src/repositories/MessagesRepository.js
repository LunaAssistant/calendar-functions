const admin = require("firebase-admin");

class MessagesRepository {
  saveMessage(whatsappNumber, messageId, message) {
    message.createdAt = new Date();

    return this.saveContact(whatsappNumber)
      .then(() => {
        return admin
          .firestore()
          .collection(`contacts/${whatsappNumber}/messages`)
          .doc(messageId)
          .set(message);
      })
      .catch((error) => {
        console.log("Error saving message in DB", error);
      });
  }

  saveContact(whatsappNumber) {
    return admin
      .firestore()
      .collection("contacts")
      .doc(whatsappNumber)
      .set({
        whatsappNumber,
      })
      .catch((error) => {
        console.log("Error saving contact in DB", error);
      });
  }

  saveStatus(status) {
    const { recipient_id, id } = status;

    return admin
      .firestore()
      .collection(`contacts/${recipient_id}/messages/${id}/statuses`)
      .add(status)
      .catch((error) => {
        console.log("Error saving status in DB", error);
      });
  }
}

exports.MessagesRepository = MessagesRepository;
