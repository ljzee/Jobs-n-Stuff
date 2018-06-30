const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { APP_SECRET } = require('../utils');

async function signup(parent, args, context, info) {
  let token = null;
  let user = await context.db.query.user({ where: { email: args.email } }, `{ id }`);
  if (!user) {
    const password = await bcrypt.hash(args.password, 10);
    user = await context.db.mutation.createUser({
      data: { ...args, password },
    }, `{ id }`);
    token = jwt.sign({ userId: user.id }, APP_SECRET)
  } else {
    throw new Error('Email is already in use');
  }

  return {
    token,
    user,
  }
}

async function login(parent, args, context, info) {
  const user = await context.db.query.user({ where: { email: args.email } }, `{ id password }`)
  if (!user) {
    throw new Error('Incorrect email or password')
  }

  const valid = await bcrypt.compare(args.password, user.password)
  if (!valid) {
    throw new Error('Incorrect email or password')
  }


  return {
    token: jwt.sign({ userId: user.id }, APP_SECRET),
    user,
  }
}

module.exports = {
  signup,
  login
}
