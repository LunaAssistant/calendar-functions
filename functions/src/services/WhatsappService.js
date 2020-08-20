const { MessagesRepository } = require("./../repositories/MessagesRepository");
const fetch = require("node-fetch");
const https = require("https");

const apiKey = process.env.whatsaap_token;

const agent = new https.Agent({
  rejectUnauthorized: false,
});

class WhatsappService {
  sendInstantReploy(whatsappNumber) {
    const message = {
      to: whatsappNumber,
      type: "text",
      recipient_type: "individual",
      text: {
        body: "Thank you for your check in 💥 \nLuna",
      },
    };

    return this.sendWhatsappMessage(`Bearer ${apiKey}`, message);
  }

  async sendWhatsappMessage(authorization, message) {
    console.log("authorization: ", authorization);
    const repository = new MessagesRepository();

    const whatsaapResponse = await fetch(
      process.env.whatsapp_host + "/messages",
      {
        method: "POST",
        headers: this.getWHeaders(authorization),
        body: JSON.stringify(message),
        redirect: "follow",
        agent: agent,
      }
    );

    return whatsaapResponse.json().then(async (response) => {
      const { messages } = response;

      if (messages) {
        message.id = messages[0].id;

        return {
          message: await repository.saveMessage(
            message.to,
            message.id,
            message
          ),
          response,
          status: whatsaapResponse.status,
        };
      }

      return {
        response,
        status: whatsaapResponse.status,
      };
    });
  }

  async checkContact(authorization, phoneNumber, check = true) {
    const response = await fetch(process.env.whatsapp_host + "/contacts", {
      method: "POST",
      headers: this.getWHeaders(authorization),
      body: JSON.stringify({
        blocking: "wait",
        contacts: [phoneNumber],
        force_check: true,
      }),
      redirect: "follow",
      agent: agent,
    });

    if (check === false) {
      return {
        valid: true,
        whatsappNumber: phoneNumber,
      };
    }

    return response.json().then((json) => {
      console.log("Check contacts from Facebook", json);

      if (response.status >= 300) {
        return {
          error: json,
        };
      }

      return {
        checkResponse: {
          valid: json.contacts[0].status === "valid",
          whatsappNumber: json.contacts[0].wa_id,
        },
      };
    });
  }

  getWHeaders(authorization) {
    let myHeaders = new fetch.Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append(
      "Authorization",
      authorization ? authorization : `Bearer ${apiKey}`
    );

    return myHeaders;
  }
}

exports.WhatsappService = WhatsappService;
