const Twit = require("twit");
const axios = require("axios");
const sharp = require("sharp");
const config = require("./config");

const fs = require("fs");
const path = require("path");

const client = new Twit(config);

const neko_endpoint = `https://nekobot.xyz/api/image?type=neko`;

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

const NekoBotLife = async () => {
  try {
    // ========================================================
    // NEKOBOT API
    // ========================================================

    // GET IMAGE DATA FROM NEKO API
    const response = await axios.get(neko_endpoint);

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
    const media = await new Promise((resolve, reject) => {
      client.post(
        "/media/upload",
        {
          media: imageData,
        },
        function (error, media, response) {
          if (error) return reject(error);

          console.log("check 1");
          console.log(response);
          resolve(media);
        }
      );
    });

    const tweetData = {
      status: "Tweet with NodeJS",
      media_ids: media.media_id_string,
    };

    await new Promise((resolve, reject) => {
      client.post("statuses/update", tweetData, function (
        error,
        tweet,
        response
      ) {
        if (error) {
          reject(error);
          console.log(error);
        } else {
          console.log("check 2");
          console.log(tweet);
          console.log(response);
          console.log("Successfully tweeted an image!");
          resolve(tweet);
        }
      });
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
