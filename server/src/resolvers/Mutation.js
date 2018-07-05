const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const app_secret = process.env.APP_SECRET;

async function signup(parent, args, context, info) {
  console.log('App secret: ' + app_secret);
  let token = null;
  let user1 = await context.db.query.user({ where: { username: args.username } }, `{ id }`);
  let user2 = await context.db.query.user({ where: { email: args.email } }, `{ id }`);

  if (user1 !== null && user2 !== null) {
    throw new Error('Username and email in use');
  } else if (user1 !== null && user2 === null) {
    throw new Error('Username in use');
  } else if (user1 === null && user2 !== null) {
    throw new Error('Email in use');
  } else {
    const password = await bcrypt.hash(args.password, 10);
    user = await context.db.mutation.createUser({
      data: { ...args, password },
    }, `{ id }`);
    token = jwt.sign({ userId: user.id }, app_secret);
  }

  return {
    token,
    user,
  }
}

async function login(parent, args, context, info) {
  const user = await context.db.query.user({ where: { username: args.username } }, `{ id password }`);

  if (!user) {
    throw new Error('Invalid username or password');
  }

  const valid = await bcrypt.compare(args.password, user.password);
  if (!valid) {
    throw new Error('Invalid username or password');
  }

  return {
    token: jwt.sign({ userId: user.id }, app_secret),
    user,
  }
}

module.exports = {
  signup,
  login
}
