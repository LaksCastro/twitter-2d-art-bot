// ===========================================================================================
// Factory that manage Pixiv Client instance
// ===========================================================================================
const Pixiv = require("pixiv-app-api");
const { PixivConfig } = require("../config");

const PixivClientInstanceFactory = () => {
  let client = null;

  const initialize = async () => {
    if (client) throw new Error("A Pixiv Client Instance Is Already Declared");

    client = new Pixiv(...PixivConfig);

    await client.login();
  };

  const get = () => client;

  const public = {
    initialize,
    get,
  };

  return Object.freeze(public);
};

// ===========================================================================================
// Create a void Client Instance, she will to be used by all application
// ===========================================================================================
const PixivClientInstance = PixivClientInstanceFactory();

module.exports = PixivClientInstance;
