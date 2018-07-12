const { getUserId } = require('../utils')
const fs = require('fs');
const mkdirp = require('mkdirp');
const gm = require('gm').subClass({imageMagick: true});

const uploadDir = '../public/uploads';

require('dotenv').config();

const storeFS = ({ stream, filePath }) => {
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  return new Promise((resolve, reject) =>
    stream
      .on('error', error => {
        if (stream.truncated) fs.unlinkSync(filePath);
        reject(error)
      })
      .pipe(fs.createWriteStream(filePath))
      .on('error', error => reject(error))
      .on('finish', () => resolve(filePath))
  );
}

const formatImage = async (filePath, newPath) => {
  console.log('In format image function')
  gm(filePath)
    .resize('200', '200', '^')
    .gravity('Center')
    .crop('200', '200')
    .write(newPath, function (err) {
      if (!err) {
        fs.unlinkSync(filePath);
      } else {
        throw err;
      }
    });
}

const processUpload = async ( upload, ctx ) => {
  if (!upload) throw new Error('File is required for upload');

  var { stream, filename, mimetype } = await upload;
  const isImage = new RegExp('^image/.+$').test(mimetype);
  const isValidImage = new RegExp('^image/(png|jpg|jpeg)$').test(mimetype);

  if (isImage && !isValidImage) throw new Error('Image type must be jpg, jpeg, or png');

  const userId = getUserId(ctx);
  const userDir = `${uploadDir}/${userId}`;
  mkdirp.sync(userDir);

  var filePath = `${userDir}/${filename}`;
  await storeFS({ stream, filePath });

  if (isImage) {
    console.log('upload is an image')
    const newPath = `${userDir}/avatar.png`
    await formatImage(filePath, newPath);
    filePath = newPath;
    filename = 'avatar.png';
  }

  const file = {
    filename,
    mimetype,
    path: filePath
  }

  return file;
}

module.exports = {
  processUpload
}
