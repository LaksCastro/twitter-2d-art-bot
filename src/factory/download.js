const axios = require("axios");

const DownloadFactory = () => {
  const { FileManagerFactory } = require("./index");

  const FileManager = FileManagerFactory();

  // ===========================================================================================
  // This function send a request for to download a file and save in a path
  // ===========================================================================================
  // @param url: File url to download
  // @param outputPath: String with the path for to save the downloaded file
  // ===========================================================================================
  const request = async (url, outputPath, options = {}) => {
    const response = await axios({
      url,
      responseType: "stream",
      ...options,
    });

    return await new Promise((resolve, reject) => {
      response.data
        .pipe(FileManager.create(outputPath))
        .on("finish", () => resolve())
        .on("error", (e) => reject(e));
    });
  };

  const public = {
    request,
  };

  return Object.freeze(public);
};

module.exports = DownloadFactory;
