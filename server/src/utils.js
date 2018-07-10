const jwt = require('jsonwebtoken');

require('dotenv').config();

const app_secret = process.env.APP_SECRET

function getUserId(context) {
  const Authorization = context.request.get('Authorization');
  if (Authorization) {
    const token = Authorization.replace('Bearer ', '');
    const { userId } = jwt.verify(token, process.env.APP_SECRET);
    return userId;
  }

  throw new Error('Not authenticated');
}

module.exports = {
  app_secret,
  getUserId,
}
