const { GoogleAuth } = require("./../googleapi/GoogleAuth");
const {
  AccountTokensRepository,
} = require("./../repositories/AccountTokensRepository");

class TokensService {
  async generateToken(uid, code) {
    const googleAuth = new GoogleAuth();
    const repository = new AccountTokensRepository();

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
        return await {
          acccount,
          result: repository.addAccount(uid, account, tokens),
        };
      });
  }
}

exports.TokensService = TokensService;
