const axios = require("axios");
const path = require("path");
const { random } = require("../utils");

const NekoBotApiFactory = () => {
  const { DownloadFactory } = require("./index");
  const Download = DownloadFactory();

  let nekoBotTypes = ["neko", "hmidriff", "coffee", "kemonomimi", "holo"];

  let getNekoBotEndpoint = (type) =>
    `https://nekobot.xyz/api/image?type=${type}`;

  const generateResult = async (response) => {
    const {
      data: { message: imageUrl, img_name: imageFilename },
    } = response;

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

    await Download.request(imageUrl, imagePath);

    const result = {
      imageUrl,
      imageFilename,
      imagePath,
      imageWebpPath,
      imageName,
    };

    return result;
  };

  // ===========================================================================================
  // Function to execute the following steps:
  // - Get a random API available type
  // - Send a request to X endpoint (Get X endpoint using getNekoBotEndpoint())
  // - And return a result (Get result calling the generateResult() passing the response)
  // ===========================================================================================
  const get = async () => {
    const randomType = nekoBotTypes[random(0, nekoBotTypes.length - 1)];

    const endpoint = getNekoBotEndpoint(randomType);

    const response = await axios.get(endpoint);

    return response;
  };

  const public = {
    get,
    generateResult,
  };

  return Object.freeze(public);
};

module.exports = NekoBotApiFactory;
