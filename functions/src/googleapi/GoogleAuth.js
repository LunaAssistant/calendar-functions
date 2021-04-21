const {google} = require("googleapis");
const functions = require("firebase-functions");

const {
    AccountTokensRepository,
} = require("./../repositories/AccountTokensRepository.js");

const {google_auth: googleAuth} = functions.config().env;

class GoogleAuth {
    getOAuth2(clientId = null, secret = null) {
        return new google.auth.OAuth2(
            clientId ? clientId : googleAuth.client_id,
            clientId ? secret : googleAuth.client_secret,
            `postmessage`
        );
    }

    async getAuthClientForAccount(uid, accountId) {
        const repository = new AccountTokensRepository();

        const {tokens, accountRef, oauth2Client} = await repository
            .getTokens(uid, accountId)
            .then((result) => {
                const {tokens: {client_id: clientId, client_secret: clientSecret, ...tokens}} = result;

                let oauth2Client = this.getOAuth2(clientId, clientSecret);
                oauth2Client.setCredentials(tokens);
                result.oauth2Client = oauth2Client;

                return result;
            });

        return this.refreshTokenIsNeeded(
            oauth2Client,
            accountRef,
            tokens.refresh_token
        );
    }

    async refreshTokenIsNeeded(oauth2Client, accountRef, refresh_token) {
        if (oauth2Client.isTokenExpiring()) {
            const repository = new AccountTokensRepository();
            const {tokens} = await oauth2Client.refreshToken(refresh_token);

            oauth2Client.setCredentials(tokens);
            repository.updateTokens(accountRef, tokens);
        }

        return oauth2Client;
    }
}

exports.GoogleAuth = GoogleAuth;
