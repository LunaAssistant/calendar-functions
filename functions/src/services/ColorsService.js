const {
  AccountColorsRepository,
} = require("./../repositories/AccountColorsRepository");

class ColorsService {
  getColors(calendar) {
    return calendar.colors.get({}).then((response) => {
      return response.data;
    });
  }

  async syncColors(calendar, uid, accountId) {
    const respository = new AccountColorsRepository();

    return this.getColors(calendar)
      .then(async (colors) => {
        return await respository.updateColors(uid, accountId, colors);
      })
      .catch((error) => {
        console.error("error syncing color:", error);
      });
  }
}

exports.ColorsService = ColorsService;
