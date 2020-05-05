const Twit = require("twit");
const axios = require("axios");
const sharp = require("sharp");
const config = require("./config");

const fs = require("fs");
const path = require("path");

const client = new Twit(config);

const { random } = require("./utils");

const available_api_types = [
  "neko",
  "hmidriff",
  "coffee",
  "kemonomimi",
  "holo",
];

const getWaifuEndpoint = (type) => `https://nekobot.xyz/api/image?type=${type}`;

// 1000 miliseconds = 1 second
// * 60 = 60 seconds = 1 minute
// * 15 = 15 minutes
// Time interval: 15 minutes
const timeInterval = 1000 * 30;

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

const removeFile = async (file_path) => {
  fs.unlinkSync(file_path);
};

const getBase64File = (file_path) => {
  return fs.readFileSync(file_path, { encoding: "base64" });
};

const WaifuBotLife = async () => {
  try {
    // ========================================================
    // NEKOBOT API
    // ========================================================

    // GET IMAGE DATA FROM NEKO API
    const response = await axios.get(
      getWaifuEndpoint(
        available_api_types[random(0, available_api_types.length - 1)]
      )
    );

    // ========================================================
    // IMAGE
    // ========================================================

    // GET METADATA OF IMAGE
    const {
      data: { message: imageUrl, img_name: imageFilename },
    } = response;

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

    // ========================================================
    // TWITTER
    // ========================================================

    // GET TWITTER MEDIA RAW FILE
    const imageData = getBase64File(imageWebpPath);

    // UPLOAD IMAGE TO TWITTER API
    client.post("media/upload", { media: imageData }, function (error, media) {
      if (error) {
        console.log(error);
      } else {
        const status = {
          status: "#StayAtHome",
          media_ids: media.media_id_string,
        };

        client.get("media/upload");

        client.post("statuses/update", status, function (error, tweet) {
          if (error) {
            console.log(error);
          } else {
            console.log("Successfully tweeted an image!");
          }
        });
      }
    });

    // ========================================================
    // DELETE FILES AFTER UPLOAD TO TWITTER MEDIA API
    // ========================================================
    removeFile(imagePath);
    removeFile(imageWebpPath);
  } catch (error) {
    const date = new Date();

    const datelog = {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
    };

    console.log(datelog);

    console.log(error);
  } finally {
    setTimeout(WaifuBotLife, timeInterval);
  }
};

// Init Waifu Life
WaifuBotLife();
