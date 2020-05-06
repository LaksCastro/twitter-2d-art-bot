const TwitterReplyFactory = () => {
  const {
    TwitterApiFactory,
    ImageApiFactory,
    ConverterFactory,
    FileManagerFactory,
  } = require("./index");

  const ImageApi = ImageApiFactory();
  const Converter = ConverterFactory();
  const FileManager = FileManagerFactory();
  const TwitterApi = TwitterApiFactory();

  // ===========================================================================================
  // This function is a Wrapper for execute the following steps:
  // - Get URL of random image from ImageAPI (using ImageApi Factory)
  // - Download the image and save in local disk in /temp folder (using Download Factory)
  // - Clone the image but in webp format (using Converter Factory)
  // - Send a Twitter Reply (using using TwitterApi Factory)
  // - Delete all images on local disk, the original and webp, why they have already been sent to Twitter
  // ===========================================================================================
  // @param getStatus - Function to convert raw media data in a tweet parameters
  // @param onComplete |optional| - Function to execute when task ends
  // ===========================================================================================
  const send = async (getStatus, onComplete = () => {}) => {
    if (!getStatus)
      throw new Error("Function to get tweet status is necessary");

    try {
      console.log("\x1b[0m", "1. Fetching image from API's...");

      const { imagePath, imageWebpPath } = await ImageApi.get();

      console.log("3. Converting image to webp...");
      await Converter.convert(imagePath, imageWebpPath, "webp");

      const imageData = FileManager.getBase64(imageWebpPath);

      console.log("4. The request was sent to the Twitter server");
      TwitterApi.requestReply(imageData, getStatus, onComplete);

      FileManager.del(imagePath);
      FileManager.del(imageWebpPath);

      onComplete();
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

  const public = {
    send,
  };

  return Object.freeze(public);
};

module.exports = TwitterReplyFactory;
