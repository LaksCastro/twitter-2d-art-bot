const TwitterReplyFactory = () => {
  const {
    TwitterApiFactory,
    ImageApiFactory,
    ConverterFactory,
    FileManagerFactory,
    ConsoleFactory,
  } = require("./index");

  const ImageApi = ImageApiFactory();
  const Converter = ConverterFactory();
  const FileManager = FileManagerFactory();
  const TwitterApi = TwitterApiFactory();
  const Console = ConsoleFactory();

  // ===========================================================================================
  // This function is a Wrapper for execute the following tasks:
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

    let imagePath,
      imageWebpPath = null;

    try {
      Console.write("1. Fetching image from API's...");

      const {
        imagePath: imgPath,
        imageWebpPath: imgWebPath,
      } = await ImageApi.get();

      imagePath = imgPath;
      imageWebpPath = imgWebPath;

      Console.write("3. Converting image to webp...");
      await Converter.convert(imagePath, imageWebpPath, "webp");

      const imageData = FileManager.getBase64(imageWebpPath);

      Console.write("4. The request was sent to the Twitter server");

      TwitterApi.requestReply(imageData, getStatus, onComplete);

      onComplete();
    } catch (error) {
      const date = new Date();

      const datelog = {
        date: date.toLocaleDateString(),
        time: date.toLocaleTimeString(),
      };

      Console.error(datelog);
      Console.error(error);

      Console.error("An error ocurred...");
      Console.write("Trying again...");

      // Try again in 30 seconds...
      setTimeout(() => send(getStatus, onComplete), 1000 * 10);
    } finally {
      FileManager.del(imagePath);
      FileManager.del(imageWebpPath);
    }
  };

  const public = {
    send,
  };

  return Object.freeze(public);
};

module.exports = TwitterReplyFactory;
