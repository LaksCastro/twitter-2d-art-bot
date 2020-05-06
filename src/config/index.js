require("dotenv/config");

const TwitterConfig = {
  consumer_key: process.env.CONSUMER_KEY,
  consumer_secret: process.env.CONSUMER_SECRET,
  access_token: process.env.ACCESS_TOKEN,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
};

const PixivConfig = [
  process.env.PIXIV_NAME,
  process.env.PIXIV_PASSWORD,
  {
    camelcaseKeys: true,
  },
];

module.exports = {
  TwitterConfig,
  PixivConfig,
};
