const axios = require("axios");
const path = require("path");

const NekoBotApiFactory = () => {
  const { random } = require("../utils");

  const DownloadFactory = require("./download");
  const HistoryFactory = require("./history");
  const ConsoleFactory = require("./console");

  const Download = DownloadFactory();
  const History = HistoryFactory();
  const Console = ConsoleFactory();

  let nekoBotTypes = ["neko", "hmidriff", "kemonomimi"];

  let getNekoBotEndpoint = (type) =>
    `https://nekobot.xyz/api/image?type=${type}`;

  const api_name = "nekobot_api";

  let maxTry = 30;
  let currentTry = 0;

  // ===========================================================================================
  // Function to manage image fetched in get() method, she will do:
  // - Generate imageId, imageName, imagePath, etc.
  // - To download image
  // - Return default data format
  // ===========================================================================================
  // - Data format:
  // {
  //   "imageUrl": String
  //   "imageFilename": String
  //   "imagePath": String
  //   "imageWebpPath": String
  //   "imageName": String
  //   "imageId": String
  //   "imageAuthor": String
  //   "source": String
  //   "availableIn": String
  // }
  // ===========================================================================================
  const generateResult = async (response) => {
    const {
      data: { message: imageUrl, img_name: imageFilename },
    } = response;

    const imageId = `neko__bot--${imageUrl}`;

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
      imageId,
      imageAuthor: null,
      source: api_name,
      availableIn: imageUrl,
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

    const {
      data: { message: imageUrl },
    } = response;

    const imageId = `neko__bot--${imageUrl}`;

    const history = History.getHistory();

    // To prevent to send duplicated images
    if (history.some((img) => img.imageId === imageId)) {
      currentTry++;

      if (maxTry < currentTry) {
        Console.write(
          Console.yellow("This artist has a loot of arts twitted, log:")
        );
        Console.write(Console.yellow(response));
        throw new Error("Something is wrong, verify this");
      }

      return await axios.get(endpoint);
    }

    currentTry = 0;

    return response;
  };

  const public = {
    get,
    generateResult,
    api_name,
  };

  return Object.freeze(public);
};

module.exports = NekoBotApiFactory;
