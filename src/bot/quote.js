const { TwitterReplyFactory } = require("../factory");

const { get } = require("../client/twitter");

const AutomaticReplyFactory = () => {
  const TwitterReply = TwitterReplyFactory();

  let client = null;

  // ===========================================================================================
  // This function is executed when anyone mark the bot (Read about enable function, more below)
  // ===========================================================================================
  // @param tweet - All twitter tweet data, all about date, user
  // ===========================================================================================
  const onUserQuoteBot = (tweet) => {
    const { user, id_str } = tweet;

    console.log("\x1b[36m%s\x1b[0m", "Starting reply generation...");

    const whenTaskEnds = () => {
      console.log(
        "\x1b[36m%s\x1b[0m",
        "Successfully reply to user: " + user.name
      );
    };

    const getStatus = (media) => ({
      status: `@${user.name} #StayAtHome`,
      media_ids: media.media_id_string,
      in_reply_to_status_id: id_str,
    });

    TwitterReply.send(getStatus, whenTaskEnds);
  };

  // ===========================================================================================
  // This function enable a listener for to send automatic reply when anyone mark the bot in a tweet, thus:
  // ~ le me (@UserName) in Twitter: "Woooow, this bot @WaifuAwesomeBot is working in a code with Factory Pattern"
  // ~ le bot listen and reply: "@UserName #StayInHome" with a lendary image ;)
  // ===========================================================================================
  const enable = () => {
    client = get();

    const stream = client.stream("statuses/filter", {
      track: ["@WaifuAwesomeBot"],
    });

    stream.on("tweet", onUserQuoteBot);
  };

  const public = {
    enable,
  };

  return Object.freeze(public);
};

module.exports = AutomaticReplyFactory;
