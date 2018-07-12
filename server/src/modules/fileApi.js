const { getUserId } = require('../utils')
const fs = require('fs');
const mkdirp = require('mkdirp');
const Jimp = require('jimp');
const shell = require('shelljs');

const uploadDir = './uploads';

require('dotenv').config();

const storeFS = ({ stream, path }) => {
  if (fs.existsSync(path)) fs.unlinkSync(path);

  return new Promise((resolve, reject) =>
    stream
      .on('error', error => {
        if (stream.truncated) fs.unlinkSync(path);
        reject(error)
      })
      .pipe(fs.createWriteStream(path))
      .on('error', error => reject(error))
      .on('finish', () => resolve(path))
  );
}

const resizeImage = async (path, filename, userId) => {
  var userDir = `${uploadDir}/${userId}`;
  const tempPath = `${userDir}/temp-${filename}`;

  fs.renameSync(path, tempPath);

  Jimp.read(tempPath)
    .then(function (lenna) {
      lenna.resize(150, 150)
        .quality(75)
        .write(path);
      fs.unlinkSync(tempPath);
    })
    .catch((e) => {
        throw e;
    });
}

const processUpload = async ( upload, ctx ) => {
  if (!upload) {
    throw new Error('File is required for upload');
  }

  const { stream, filename, mimetype } = await upload;
  var mimereg = new RegExp('^image/')

  const userId = getUserId(ctx);

  var userDir = `${uploadDir}/${userId}`;
  mkdirp.sync(userDir);
  const path = `${userDir}/${filename}`;

  await storeFS({ stream, path });

  if (mimereg.test(mimetype)) {
    await resizeImage(path, filename, userId);
  }

  const file = {
    filename,
    mimetype,
    path
  }

  return file;
}

module.exports = {
  processUpload,
}
