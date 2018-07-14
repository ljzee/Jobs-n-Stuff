const { getUserId } = require('../utils')
const fs = require('fs');
const mkdirp = require('mkdirp');
const shortid = require('shortid');
const gm = require('gm').subClass({imageMagick: true});

require('dotenv').config();

const uploadDir = '../public/uploads';
const isImageRegEx = new RegExp('^image/.+$');

const storeDocument = ({ stream, filePath }) => {
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

const storeImage = ({ stream, filePath }) => {
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

const processUpload = async ( stream, filename, mimetype, username ) => {
  const fileId = shortid.generate();
  const isImage = isImageRegEx.test(mimetype);

  var payload = {
    file: null,
    errors: {
      fileexists: '',
      filetype:'',
      filesize: ''
    }
  }

  if (isImage) {
    const userDir = `${uploadDir}/${username}`
    mkdirp.sync(userDir);

    var filePath = `${userDir}/${fileId}-${filename}`;
    await storeImage({ stream, filePath });

    const newPath = `${userDir}/${fileId}-avatar.png`
    await formatImage(filePath, newPath);
    filename = `${fileId}-avatar.png`

    payload.file = {
      filename,
      mimetype,
      path: filePath
    }
  }

  return payload;
}

module.exports = {
  processUpload
}
