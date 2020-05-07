const path = require("path");

const PixivApiFactory = () => {
  const { random } = require("../utils");

  const DownloadFactory = require("./download");
  const HistoryFactory = require("./history");
  const ConsoleFactory = require("./console");
  const Download = DownloadFactory();
  const History = HistoryFactory();
  const Console = ConsoleFactory();

  const client = require("../client/pixiv").get();

  const api_name = "pixiv_api";

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
    const index = random(0, response.illusts.length - 1);

    const image = response.illusts[index];

    const { id: imageId, imageUrls: imageSizes } = image;

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

      return await generateResult(response);
    }

    currentTry = 0;

    const { large: imageUrl } = imageSizes;

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
      imageId,
      imageAuthor: response.author,
      source: api_name,
      availableIn: `https://www.pixiv.net/en/artworks/${imageId}`,
    };

    return result;
  };

  // ===========================================================================================
  // Function to execute the following steps:
  // - Get all the artists being followed by the account owner defined in process.env
  // - Select a random artist
  // - Select a random illustration of this selected artist
  // - Return the illustration (illustration = image)
  // ===========================================================================================
  const get = async () => {
    const {
      user: { id: userId },
    } = client.authInfo();

    const { userPreviews: followers } = await client.userFollowing(userId);

    const followerToGetIllust = followers[random(0, followers.length - 1)];

    const { id, name } = followerToGetIllust.user;

    const response = await client.userIllusts(id);

    return { ...response, author: name };
  };

  const public = {
    get,
    generateResult,
    api_name,
  };

  return Object.freeze(public);
};

module.exports = PixivApiFactory;
