// ===========================================================================================
// This is a Entrypoint, all bot work with the imported modules here
// ===========================================================================================
(async function EntryPoint() {
  const TwitterClient = require("./client/twitter");
  await TwitterClient.initialize();

  const PixivClient = require("./client/pixiv");
  await PixivClient.initialize();

  const BotFactory = require("./bot");
  const Bot = BotFactory();

  Bot.initialize();
})();
