
const uuid = require('uuid/v1');
const aws = require('aws-sdk');
const { getUserId } = require('../utils')

require('dotenv').config();

const s3 = new aws.S3({
  accessKeyId: process.env.S3_KEY,
  secretAccessKey: process.env.S3_SECRET,
  params: {
    Bucket: process.env.S3_BUCKET
  }
});

const processUpload = async ( upload, ctx ) => {
  if (!upload) {
    throw new Error('File is required for upload');
  }

  const { stream, filename, mimetype, encoding } = await upload;
  const userId = getUserId(ctx);
  const key = uuid() + '-' + filename;

  const response = await s3
    .upload({
      Key: key,
      ACL: 'public-read',
      Body: stream
    }).promise();

  const url = response.Location;

  const data = {
    filename,
    mimetype,
    key,
    url,
    user: { connect: { id: userId } },
  }

  const { id } = await ctx.db.mutation.createFile({ data }, ` { id } `);

  const file = {
    id,
    filename,
    mimetype,
    url,
  }

  console.log('saved prisma file:');
  console.log(file);

  return file;
}

module.exports = {
  processUpload,
}
