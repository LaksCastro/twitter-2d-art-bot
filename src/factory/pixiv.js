// const axios = require("axios");
const path = require("path");
// const pixivImg = require("pixiv-img");
const { random } = require("../utils");

const PixivApiFactory = () => {
  const { DownloadFactory } = require("./index");
  const Download = DownloadFactory();

  const client = require("../client/pixiv").get();

  const generateResult = async (response) => {
    const index = random(0, response.illusts.length - 1);

    const imageSizes = response.illusts[index].imageUrls;

    const imageUrl = imageSizes.large;

    const parts = imageUrl.split("/");

    const imageFilename = parts[parts.length - 1];

    const imageName = imageFilename
      .split(".")
      .filter((_, i, all) => i < all.length - 1)
      .join(".");

    const imagePath = path.normalize(
      path.join(__dirname, "..", "temp", imageFilename)
    );

    const imageWebpPath = path.normalize(
      path.join(__dirname, "..", "temp", imageName + ".webp")
    );

    await Download.request(imageUrl, imagePath, {
      responseEncoding: null,
      headers: {
        Referer: "http://www.pixiv.net/",
      },
    });

    const result = {
      imageUrl,
      imageFilename,
      imagePath,
      imageWebpPath,
      imageName,
    };

    return result;
  };

  const get = async () => {
    const response = await client.illustRecommended({
      sort: "popular_desc",
      restrict: "public",
    });

    return response;
  };

  const public = {
    get,
    generateResult,
  };

  return Object.freeze(public);
};

module.exports = PixivApiFactory;
