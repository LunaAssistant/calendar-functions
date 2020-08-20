const { google } = require("googleapis");

const {
  AccountTokensRepository,
} = require("./../repositories/AccountTokensRepository.js");

const config = {
  baseUrl: process.env.googleauth_host,
  clientId: process.env.googleauth_clientId,
  clientSecret: process.env.googleauth_clientSecret,
};

class GoogleAuth {
  getOAuth2() {
    return new google.auth.OAuth2(
      config.clientId,
      config.clientSecret,
      `postmessage`
    );
  }

  async getAuthClientForAccount(uid, accountId) {
    const repository = new AccountTokensRepository();

    const { tokens, accountRef, oauth2Client } = await repository
      .getTokens(uid, accountId)
      .then((result) => {
        const { tokens } = result;

        let oauth2Client = this.getOAuth2();
        oauth2Client.setCredentials(tokens);
        result.oauth2Client = oauth2Client;

        return result;
      });

    return await this.refreshTokenIsNeeded(
      oauth2Client,
      accountRef,
      tokens.refresh_token
    );
  }

  async refreshTokenIsNeeded(oauth2Client, accountRef, refresh_token) {
    if (oauth2Client.isTokenExpiring()) {
      const repository = new AccountTokensRepository();
      const { tokens } = await oauth2Client.refreshToken(refresh_token);

      oauth2Client.setCredentials(tokens);
      repository.updateTokens(accountRef, tokens);
    }

    return oauth2Client;
  }
}

exports.GoogleAuth = GoogleAuth;
