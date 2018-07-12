const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { processUpload } = require('../files/fileApi');
const { getUserId } = require('../utils');

require('dotenv').config();

const app_secret = process.env.APP_SECRET;

function sameUser(user1, user2) {
  if (user1 !== null && user2 !== null) {
    return user1.id === user2.id;
  } else {
    return false;
  }
}

async function signup(parent, args, ctx, info) {
  let token = null;
  let user1 = await ctx.db.query.user({ where: { username: args.username } }, `{ id username }`);
  let user2 = await ctx.db.query.user({ where: { email: args.email } }, `{ id email }`);
  let valid = true;
  let err = '';

  if (user1 !== null && args.username === user1.username) {
    valid = false;
    err = err + 'Username in use.';
  }
  if (user2 !== null && args.email === user2.email) {
    valid = false;
    err = err + 'Email in use.';
  }

  if (valid) {
    const password = await bcrypt.hash(args.password, 10);
    const user = await ctx.db.mutation.createUser({
      data: { ...args, password },
    }, `{ id }`);

    if (args.role === 'BASEUSER') {
      await ctx.db.mutation.createUserProfile({
        data: {
          firstname: '',
          lastname: '',
          preferredname: '',
          phonenumber: '',
          user: { connect: { id: user.id } }
        },
      }, `{ id }`);
    }
    if (args.role === 'BUSINESS') {
      await ctx.db.mutation.createBusinessProfile({
        data: {
          name: '',
          description: '',
          phonenumber: '',
          address: '',
          website: '',
          user: { connect: { id: user.id } }
        },
      }, `{ id }`);
    }
    token = jwt.sign({ userId: user.id }, app_secret);
    return { token, user }
  } else {
    throw new Error(err)
  }
}

async function login(parent, args, ctx, info) {
  const user = await ctx.db.query.user({ where: { username: args.username } }, `{ id password }`);

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

async function updateuser(parent, args, ctx, info) {
  const userId = getUserId(ctx);
  let user = await ctx.db.query.user({ where: { id: userId } }, `{ id userprofile { id } }`);
  let user1 = await ctx.db.query.user({ where: { username: args.username } }, `{ id username }`);
  let user2 = await ctx.db.query.user({ where: { email: args.email } }, `{ id email }`);
  let valid = true;
  let err = '';

  if (!sameUser(user, user1) && user1 !== null && args.username === user1.username) {
    valid = false;
    err = err + 'Username in use.';
  }
  if (!sameUser(user, user2) && user2 !== null && args.email === user2.email) {
    valid = false;
    err = err + 'Email in use.';
  }

  if (valid) {
    await ctx.db.mutation.updateUserProfile({
      data: {
        firstname: args.firstname,
        lastname: args.lastname,
        preferredname: args.preferredname,
        phonenumber: args.phonenumber
      },
      where: {id: user.userprofile.id}
    }, info);
    return await ctx.db.mutation.updateUser({
      data: {
        username: args.username,
        email: args.email
      },
      where: {id: userId}
    }, info);
  } else {
    throw new Error(err);
  }
}

async function uploadFile(parent, { file, name, filetype }, ctx, info) {
  const userId = getUserId(ctx);
  const user = await ctx.db.query.user({ where: { id: userId } }, `{ id files { id  path } }`);

  const newFile = await processUpload(await file, ctx);

  const path = `/uploads/${userId}/${newFile.filename}`;

  for (var i = 0; i < user.files.length; i++) {
    const existingFile = user.files[i];
    if (existingFile.path === path) {
      return await ctx.db.mutation.updateFile({
        data: {
          name,
          filetype,
          filename: newFile.filename,
          path,
          mimetype: newFile.mimetype
        },
        where: {id: file.id}
      }, info);
    }
  }

  return await ctx.db.mutation.createFile({
    data: {
      name,
      filetype,
      filename: newFile.filename,
      path,
      mimetype: newFile.mimetype,
      user: { connect: { id: userId } }
    }
  }, info);
}

// async function deleteFile(parent, { id }, ctx, info) {
//   return await ctx.db.mutation.deleteFile({ where: { id } }, info)
// }

const Mutation = {
  signup,
  login,
  updateuser,
  uploadFile
}

module.exports = {
  Mutation
}
