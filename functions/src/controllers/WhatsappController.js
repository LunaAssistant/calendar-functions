const { MessagesRepository } = require("./../repositories/MessagesRepository");
const { WhatsappService } = require("./../services/WhatsappService");
const { Validator } = require("./../validations/Validator.js");
const { messageSchema } = require("./../validations/schemas/WhatsappSchemas");

exports.sendMessage = async (request, response) => {
  const validator = new Validator();
  let { validation } = await validator.validate(messageSchema, request);

  if (validation) {
    return response.status(400).send({
      error: validation,
    });
  }

  const service = new WhatsappService();
  let messageBody = request.body;

  try {
    const { checkResponse, error } = await service.checkContact(
      request.headers.authorization,
      request.body.to,
      request.body.check_contact
    );

    if (error) {
      return response.status(400).send(error);
    }

    if (checkResponse.valid) {
      messageBody.to = checkResponse.whatsappNumber;

      service
        .sendWhatsappMessage(request.headers.authorization, messageBody)
        .then((res) => {
          response.status(res.status).send(res.response);

          return res;
        })
        .catch((error) => {
          response.status(500).send(error);
        });
    } else {
      response
        .status(400)
        .send({ error: `Invalid phoneNumber: ${request.body.to}` });
    }
  } catch (error) {
    console.log("error", error);
    response.status(500).send({ error: "Internal error", detail: error });
  }
};

exports.webHook = async (request, response) => {
  const service = new WhatsappService();
  const repository = new MessagesRepository();

  if (request.body.messages && request.body.messages.length > 0) {
    const repliedPromises = request.body.messages.map((message) => {
      repository.saveMessage(message.from, message.id, message);

      return service.sendInstantReploy(message.from);
    });

    Promise.all(repliedPromises)
      .then((result) => {
        response.send(result);

        return result;
      })
      .catch((error) => {
        console.error(error);
        response.send(500).send(error);
      });
  }

  if (request.body.statuses && request.body.statuses.length > 0) {
    request.body.statuses.forEach((status) => {
      repository.saveStatus(status);
    });

    response.send({
      status: "OK",
    });
  }
};
