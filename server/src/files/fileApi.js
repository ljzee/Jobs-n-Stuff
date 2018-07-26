const fs = require('fs');
const mkdirp = require('mkdirp');
const shortid = require('shortid');
const gm = require('gm').subClass({imageMagick: true});
const promisesAll = require('promises-all');
const Timeout = require('await-timeout');

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

const processUpload = async ( upload ) => {
  let { stream } = await upload.file;
  const filePath = upload.filepath

  return storeDocument({ stream, filePath });
}

const processSingleUpload = async ( upload ) => {
  const fileId = shortid.generate();
  let file = null;

  let { stream, filename, mimetype } = await upload.file;

  const isImage = isImageRegEx.test(mimetype);

  const userDir = `${uploadDir}/${upload.username}`
  mkdirp.sync(userDir);

  const filePath = `${userDir}/${fileId}-${filename}`;
  await storeDocument({ stream, filePath });

  if (isImage) {
    const newPath = `${userDir}/${fileId}-avatar.png`
    await formatImage(filePath, newPath);
    filename = `${fileId}-avatar.png`
  } else {
    filename = `${fileId}-${filename}`;
  }

  file = {
    filename,
    mimetype,
    path: filePath
  }

  return file;
}

const multipleUpload = async (uploads) => {
  let files = [];
  let docs = [];
  const userDir = `${uploadDir}/${uploads[0].username}`;
  mkdirp.sync(userDir);

  for (let i = 0; i < uploads.length; i++) {
    const fileId = shortid.generate();
    const upload = uploads[i];

    const storedName = `${fileId}-${upload.filename}`;
    const filePath = `${userDir}/${storedName}`;

    const file = {
      filename: upload.filename,
      storedName,
      name: upload.name,
      filetype: upload.filetype,
      mimetype: upload.mimetype,
      size: upload.size
    }
    files.push(file);

    const doc = {
      file: upload.file,
      filepath: filePath
    }
    docs.push(doc);
  }

  const { resolve, reject } = await promisesAll.all(
    docs.map(processUpload)
  );

  if (reject.length) {
    reject.forEach(({ name, message }) =>
      console.error(`${name}: ${message}`)
    )
  }

  return files;
}

const closeStream = async (upload) => {
  const timeout = new Timeout();
  Promise.race([
    upload.file,
    timeout.set(1000, 'Timeout!')
  ])
  .then(result => {
    timeout.clear();
    return new Promise((resolve, reject) =>
      result.stream
        .on('error', error => reject(error))
        .destroy()
        .on('error', error => reject(error))
        .on('finish', () => resolve())
      );
  })
  .catch(e => {
    timeout.clear();
    if (e.message === 'Request disconnected during file upload stream parsing.') {
      console.log('Stream closed as expected');
    } else {
      console.error('Caught unexpected error:', error.message);
    }
  });
}

module.exports = {
  processSingleUpload,
  multipleUpload,
  closeStream
}
