var ImageKit = require("imagekit");
var nanoid = require("nanoid");
var fs = require("fs");
var imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

function uploadFile(file) {
  return new Promise((res, rej) => {
    imagekit.upload(
      {
        file: fs.createReadStream(file.path),
        fileName: nanoid.nanoid(),
        folder: "MoodyAudios",
      },
      (error, result) => {
        if (error) {
          rej(JSON.stringify(error));
        } else {
          res(result);
        }
      }
    );
  });
}

module.exports = uploadFile;
