const Twit = require("twit");
const axios = require("axios");
const sharp = require("sharp");
const config = require("./config");

const fs = require("fs");
const path = require("path");

const Twitter = new Twit(config);

const neko_endpoint = `https://nekobot.xyz/api/image?type=neko`;
const twitter_upload_endpoint = `https://upload.twitter.com`;

const multipart_headers = {
  "Content-Type": `multipart/form-data`,
};

// To download and save image from url
const download = async (url, image_path) => {
  const response = await axios({
    url,
    responseType: "stream",
  });
  return await new Promise((resolve, reject) => {
    response.data
      .pipe(fs.createWriteStream(image_path))
      .on("finish", () => resolve())
      .on("error", (e) => reject(e));
  });
};

const NekoBotLife = async () => {
  try {
    // =================================
    // NEKOBOT API
    // =================================
    // GET IMAGE DATA FROM NEKO API

    const response = await axios.get(neko_endpoint);

    // =================================
    // IMAGE
    // =================================

    // GET METADATA OF IMAGE
    const {
      data: { message: imageUrl, img_name: imageFilename },
    } = response;

    const imageExt = imageFilename.split(".")[
      imageFilename.split(".").length - 1
    ];

    const imageName = imageFilename
      .split(".")
      .filter((_, i, all) => i < all.length - 1)
      .join(".");

    const imagePath = path.normalize(
      path.join(__dirname, "temp", imageFilename)
    );

    const imageWebpPath = path.normalize(
      path.join(__dirname, "temp", imageName + ".webp")
    );

    // DOWNLOAD IMAGE
    await download(imageUrl, imagePath);

    // CONVERT IMAGE TO WEBP
    await sharp(imagePath).toFormat("webp").toFile(imageWebpPath);

    // =================================
    // TWITTER
    // =================================

    // GENERATE TWITTER MEDIA PARAMETERS
    const media_category = imageExt === "gif" ? "tweet_gif" : "tweet_image";

    // const twitterEndpoint = "";

    // const teste = await Twitter.post(twitterEndpoint, {
    //   status: message,
    // });

    console.log("ok");
  } catch (error) {
    const date = new Date();

    const datelog = {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
    };

    console.log(datelog);

    console.log(error);
  }
};

// 1000 miliseconds = 1 second
// * 60 = 60 seconds = 1 minute
// * 15 = 15 minutes
// Time interval: 15 minutes
const timeInterval = 1000 * 60 * 15;

// Every [timeInterval] execute NekoBotLife to create a Tweet
setInterval(NekoBotLife, timeInterval);

// Init Nekobot life
NekoBotLife();
