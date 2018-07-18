const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const { processUpload } = require('../files/fileApi');
const { getUserId } = require('../utils');
const validator = require('validator');

require('dotenv').config();

const app_secret = process.env.APP_SECRET;
const phoneRegEx = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
const usernameRegEx = /^[a-z0-9]+$/i;
const maxImageSize = 500000; // 5 KB
const maxDocSize = 5000000; // 5 MB
const isImageRegEx = new RegExp('^image/.+$');
const isValidImageRegEx = new RegExp('^image/(png|jpg|jpeg)$');

function sameUser(user1, user2) {
  if (user1 !== null && user2 !== null) {
    return user1.id === user2.id;
  } else {
    return false;
  }
}

async function signup(parent, args, ctx, info) {
  var user1 = await ctx.db.query.user({ where: { username: args.username } }, `{ id username }`);
  var user2 = await ctx.db.query.user({ where: { email: args.email } }, `{ id email }`);
  var valid = true;
  var usernameValid = true;
  var emailValid = true;

  var payload = {
    token: null,
    user: null,
    errors: {
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  }

  if (args.username === '' || args.username.trim().length > 32) {
    valid = false;
    usernameValid = false;
    payload.errors.username = 'Username must be between 1 and 32 characters';
  }

  if (usernameValid && !usernameRegEx.test(args.username)) {
    valid = false;
    usernameValid = false;
    payload.errors.username = 'Invalid username. Username can only contain letters [a..Z] and numbers [0..9]';
  }

  if (usernameValid && user1 !== null && args.username === user1.username) {
    valid = false;
    usernameValid = false;
    payload.errors.username = 'Username already in use';
  }

  if (args.email === '') {
    valid = false;
    emailValid = false;
    payload.errors.email = 'Please enter an email';
  }

  if (emailValid && !validator.isEmail(args.email)) {
    valid = false;
    emailValid = false;
    payload.errors.email = 'Invalid email';
  }

  if (emailValid && user2 !== null && args.email === user2.email) {
    valid = false;
    emailValid = false;
    payload.errors.email = 'Email already in use';
  }

  if (args.password.trim().length < 8 || args.password.trim().length > 32) {
    valid = false;
    passwordValid = false;
    payload.errors.password = 'Password must be between 8 and 32 characters';
  }

  if (args.password !== args.confirmPassword) {
    valid = false;
    payload.errors.confirmPassword = 'Passwords do not match';
  }

  if (valid) {
    const password = await bcrypt.hash(args.password, 10);
    const user = await ctx.db.mutation.createUser({
      data: {
        username: args.username,
        email: args.email,
        password: password,
        role: args.role,
        activated: args.activated
      },
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
    payload.token = jwt.sign({ userId: user.id }, app_secret);
    payload.user = user;
  }

  return payload;
}

async function login(parent, args, ctx, info) {
  const user = await ctx.db.query.user({ where: { username: args.username } }, `{ id password }`);
  var validLogin = true;

  var payload = {
    token: null,
    user: null,
    errors: {
      login: ''
    }
  }

  if (!user) {
    validLogin = false;
    payload.errors.login = 'Invalid username or password';
  }

  const valid = await bcrypt.compare(args.password, user.password);
  if (!valid) {
    validLogin = false;
    payload.errors.login = 'Invalid username or password';
  }

  if (validLogin) {
    payload.token = jwt.sign({ userId: user.id }, app_secret);
    payload.user = user;
  }

  return payload;
}

async function updatePassword(parent, args, ctx, info) {
  const user = await ctx.db.query.user({ where: { username: args.username } }, `{ id password }`);
  var valid = true;
  var newPasswordValid = true;

  var payload = {
    success: false,
    errors: {
      oldpassword: '',
      newpassword: '',
      newpassword2: ''
    }
  }

  const validPassword = await bcrypt.compare(args.oldpassword, user.password);
  if (!validPassword) {
    valid = false;
    payload.errors.oldpassword = 'Password is incorrect';
  }

  if (valid) {
    if (args.oldpassword === args.newpassword) {
      valid = false;
      newPasswordValid = false;
      payload.errors.newpassword = 'New password cannot match old password';
    }

    if (newPasswordValid && (args.newpassword.trim().length < 8 || args.newpassword.trim().length > 32)) {
      valid = false;
      payload.errors.newpassword = 'Password must be between 8 and 32 characters';
    }

    if (newPasswordValid && args.newpassword !== args.newpassword2) {
      valid = false;
      payload.errors.newpassword2 = 'Passwords do not match';
    }
  }

  if (valid) {
    const password = await bcrypt.hash(args.newpassword, 10);
    await ctx.db.mutation.updateUser({
      data: {
        password
      },
      where: {username: args.username}
    }, `{ id }`);
    payload.success = true;
  }

  return payload;
}

async function updateuser(parent, args, ctx, info) {
  const userId = getUserId(ctx);
  var user = await ctx.db.query.user({ where: { id: userId } }, `{ id userprofile { id } }`);
  var user1 = await ctx.db.query.user({ where: { username: args.username } }, `{ id username }`);
  var user2 = await ctx.db.query.user({ where: { email: args.email } }, `{ id email }`);
  var valid = true;
  var usernameValid = true;
  var emailValid = true;
  var phonenumberValid = true;

  var payload = {
    user: null,
    errors: {
      username: '',
      email: '',
      firstname: '',
      lastname: '',
      phonenumber: ''
    }
  }

  if (args.username === '' || args.username.trim().length > 32) {
    valid = false;
    usernameValid = false;
    payload.errors.username = 'Username must be between 1 and 32 characters';
  }

  if (usernameValid && !usernameRegEx.test(args.username)) {
    valid = false;
    usernameValid = false;
    payload.errors.username = 'Not a valid username. Username can only contain letters [a..Z] and numbers [0..9]';
  }

  if (usernameValid && !sameUser(user, user1) && user1 !== null && args.username === user1.username) {
    valid = false;
    usernameValid = false;
    payload.errors.username = 'Username already in use';
  }

  if (args.email === '') {
    valid = false;
    emailValid = false;
    payload.errors.email = 'Please enter an email';
  }

  if (emailValid && !validator.isEmail(args.email)) {
    valid = false;
    emailValid = false;
    payload.errors.email = 'Not a valid email address';
  }

  if (emailValid && !sameUser(user, user2) && user2 !== null && args.email === user2.email) {
    valid = false;
    emailValid = false;
    payload.errors.email = 'Email already in use';
  }

  if (args.firstname === '' || args.firstname.trim().length > 32) {
    valid = false;
    payload.errors.firstname = 'First name must be between 1 and 32 characters';
  }

  if (args.lastname === '' || args.lastname.trim().length > 32) {
    valid = false;
    payload.errors.lastname = 'Please enter your last name';
  }

  if (args.phonenumber === '') {
    valid = false;
    phonenumberValid = false;
    payload.errors.phonenumber = 'Please enter your phone number';
  }

  var formattedPhone = '';
  if(phonenumberValid && phoneRegEx.test(args.phonenumber)) {
    var unformattedPhone = args.phonenumber;
    formattedPhone = unformattedPhone.replace(phoneRegEx, "($1) $2-$3");
  } else {
    valid = false;
    payload.errors.phonenumber = 'Not a valid phone number';
  }

  if (valid) {
    await ctx.db.mutation.updateUserProfile({
      data: {
        firstname: args.firstname,
        lastname: args.lastname,
        preferredname: args.preferredname,
        phonenumber: formattedPhone
      },
      where: {id: user.userprofile.id}
    }, `{ id }`);
    payload.user =  await ctx.db.mutation.updateUser({
      data: {
        username: args.username,
        email: args.email
      },
      where: {id: userId}
    }, `{ id username }`);
  }

  return payload;
}

async function uploadFile(parent, { file, name, filetype, size, filename, overwrite }, ctx, info) {
  const userId = getUserId(ctx);
  const user = await ctx.db.query.user({ where: { id: userId } }, `{ id username files { id  path filename storedName } }`);
  var fileExists = false;
  var updateFileId = '';
  var valid = true;

  var payload = {
    file: null,
    errors: {
      fileexists: '',
      filetype: '',
      filesize: ''
    }
  }

  if (!file) {
    valid = false;
    payload.errors.fileexists = 'File is required for upload';
  }

  var { stream, uploadname, mimetype } = await file;

  const isImage = isImageRegEx.test(mimetype);
  const isValidImage = isValidImageRegEx.test(mimetype);

  if (filetype === 'PROFILEIMAGE' && size > maxImageSize) {
    valid = false;
    payload.errors.filesize = 'Image size cannot exceed 500 KB';
    var cleanup = new Promise((resolve, reject) =>
      stream
        .destroy()
        .on('error', error => {
          reject(error)
        })
        .on('finish', () => resolve())
      );
  }

  if (filetype !== 'PROFILEIMAGE' && size > maxDocSize) {
    valid = false;
    payload.errors.filesize = 'Document size cannot exceed 5 MB';
    var cleanup = new Promise((resolve, reject) =>
      stream
        .destroy()
        .on('error', error => {
          reject(error)
        })
        .on('finish', () => resolve())
      );
  }

  if (isImage && !isValidImage) {
    valid = false;
    payload.errors.filetype = 'Image type must be jpg, jpeg, or png';
    var cleanup = new Promise((resolve, reject) =>
      stream
        .destroy()
        .on('error', error => {
          reject(error)
        })
        .on('finish', () => resolve())
      );
  }

  if (valid) {
    for (var i = 0; i < user.files.length; i++) {
      const existingFile = user.files[i];
      if ((filetype === 'PROFILEIMAGE' && existingFile.filename === 'avatar.png')
          || (overwrite && existingFile.filename === filename)) {
        fileExists = true;
        updateFileId = existingFile.id;
        var deletePath = `../public/uploads/${user.username}/${existingFile.storedName}`
        if (fs.existsSync(deletePath)) fs.unlinkSync(deletePath);
      }
      if (!overwrite && existingFile.filename === filename) {
        valid = false;
        payload.errors.fileexists = `Document ${filename} already exists. Do you want to replace it?`;
        var cleanup = new Promise((resolve, reject) =>
          stream
            .destroy()
            .on('error', error => {
              reject(error)
            })
            .on('finish', () => resolve())
          );
      }
    }
    if (valid) {
      var uploadResult = await processUpload(stream, uploadname, mimetype, user.username);
      if (uploadResult.file !== null) {
        if (filetype === 'PROFILEIMAGE') filename = 'avatar.png';
        var path = `/uploads/${user.username}/${uploadResult.file.filename}`
        if (fileExists) {
          payload.file =  await ctx.db.mutation.updateFile({
            data: {
              name,
              filetype,
              filename,
              path,
              storedName: uploadResult.file.filename,
              mimetype: uploadResult.file.mimetype
            },
            where: {id: updateFileId}
          }, `{ id }`);
        } else {
          payload.file = await ctx.db.mutation.createFile({
            data: {
              name,
              filetype,
              filename,
              path,
              storedName: uploadResult.file.filename,
              mimetype: uploadResult.file.mimetype,
              user: { connect: { id: userId } }
            }
          }, `{ id }`);
        }
      } else {
        if (uploadResult.errors.fileexists !== '') {
          payload.errors.fileexists = uploadResult.errors.fileexists;
        }
        if (uploadResult.errors.filetype !== '') {
          payload.errors.filetype = uploadResult.errors.filetype;
        }
      }
    }
  }

  return payload;
}

const createOrUpdateJobPosting = async (parent, args, ctx, info) => {
  let payload = {
    jobposting: null,
    errors: null
  }
  return payload;
}

const Mutation = {
  signup,
  login,
  updateuser,
  uploadFile,
  createOrUpdateJobPosting,
  updatePassword
}

module.exports = {
  Mutation
}
