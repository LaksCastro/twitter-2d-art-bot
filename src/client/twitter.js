// ===========================================================================================
// Factory that manage Twitter Client instance
// ===========================================================================================

const Twit = require("twit");
const { TwitterConfig } = require("../config");

const TwitterClientInstanceFactory = () => {
  let client = null;

  const initialize = async () => {
    if (client)
      throw new Error("A Twitter Client Instance Is Already Declared");

    client = new Twit(TwitterConfig);
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
const TwitterClientInstance = TwitterClientInstanceFactory();

module.exports = TwitterClientInstance;
