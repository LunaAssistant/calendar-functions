const { GoogleAuth } = require("./../googleapi/GoogleAuth");
const { google } = require("googleapis");
const admin = require("firebase-admin");

const {
  AccountTokensRepository,
} = require("./../repositories/AccountTokensRepository");

const { UsersRepository } = require("./../repositories/UsersRepository");

class TokensService {
  async generateToken(uid, code) {
    const googleAuth = new GoogleAuth();
    const repository = new AccountTokensRepository();
    const userRepository = new UsersRepository();

    const oauth2Client = googleAuth.getOAuth2();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials({ access_token: tokens.access_token });

    const authInstance = google.oauth2({
      auth: oauth2Client,
      version: "v2",
    });

    return authInstance.userinfo
      .get()
      .then((response) => {
        return response.data;
      })
      .then(async (account) => {
        return {
          account,
          result: await repository.addAccount(uid, account, tokens),
        };
      })
      .then((response) => {
        userRepository.updateUser(uid, {
          accountId: response.result.docId,
        });

        return response;
      });
  }
}

exports.TokensService = TokensService;
