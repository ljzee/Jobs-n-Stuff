const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const { processSingleUpload, multipleUpload, closeStream } = require('../files/fileApi');
const { getUserId } = require('../utils');
const validator = require('validator');

require('dotenv').config();

const app_secret = process.env.APP_SECRET;
const phoneRegEx = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
const usernameRegEx = /^[a-z0-9]+$/i;
const maxImageSize = 500000; // 500 KB
const maxDocSize = 5000000; // 5 MB
const userDocQuota = 50000000; // 50 MB
const isValidImageRegEx = new RegExp('^image/(png|jpg|jpeg)$');
const isValidDocRegEx = new RegExp('^application/pdf$');
const streamErrorRegEx = new RegExp('^Request disconnected during file upload stream parsing.$')

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

async function uploadFile(parent, args, ctx, info) {
  const userId = getUserId(ctx);
  const user = await ctx.db.query.user({ where: { id: userId } }, `{ id username files { id filename storedName size } }`);
  let validUpload = true;

  let payload = {
    file: null,
    error: {
      fieldId: '',
      message: ''
    },
    quotaError: null
  }

  const upload = {
    file: args.file,
    username: user.username
  }

  const dryRunPayload = await uploadFileDryRun(user, args.file, args.filetype, args.size, args.mimetype, args.name);
  validUpload = dryRunPayload.success;

  if (validUpload && (args.size + dryRunPayload.totaldocsize) > userDocQuota) {
    validUpload = false;
    payload.quotaError = {
      uploadSize: args.size,
      remaining: (userDocQuota - dryRunPayload.totaldocsize)
    }
  }

  if (validUpload) {
    let fileExists = false;
    let updateFileId = '';
    for (let i = 0; i < user.files.length; i++) {
      const existingFile = user.files[i];
      if (args.filetype === 'PROFILEIMAGE' && existingFile.filename === 'avatar.png') {
        fileExists = true;
        updateFileId = existingFile.id;
        const deletePath = `../public/uploads/${user.username}/${existingFile.storedName}`
        if (fs.existsSync(deletePath)) fs.unlinkSync(deletePath);
      }
    }
    const uploadResult = await processSingleUpload(upload);

    let filename = args.filename;
    let size = args.size;
    if (args.filetype === 'PROFILEIMAGE') {
      filename = 'avatar.png';
      size = 0.0;
    }

    const path = `/uploads/${user.username}/${uploadResult.filename}`;
    if (fileExists) {
      payload.file = await ctx.db.mutation.updateFile({
        data: {
          name: args.name,
          filetype: args.filetype,
          filename,
          path,
          storedName: uploadResult.filename,
          size,
          mimetype: uploadResult.mimetype
        },
        where: {id: updateFileId}
      }, `{ id path }`);
    } else {
      payload.file = await ctx.db.mutation.createFile({
        data: {
          name: args.name,
          filetype: args.filetype,
          filename,
          path,
          storedName: uploadResult.filename,
          mimetype: uploadResult.mimetype,
          size,
          user: { connect: { id: userId } }
        }
      }, `{ id path }`);
    }
  } else {
    if (dryRunPayload.error !== null) {
      payload.error.fieldId = args.fieldId;
      payload.error.message = dryRunPayload.error;
    }
    closeStream(upload)
    .catch(error => {
      if (streamErrorRegEx.test(error.message)) {
        console.log('Stream closed as expected');
      } else {
        console.error('Caught unexpected error:', error.message);
      }
    });
  }

  return payload;
}

async function uploadFiles(parent, args, ctx, info) {
  const userId = getUserId(ctx);
  const user = await ctx.db.query.user({ where: { id: userId } }, `{ id username files { id filename storedName name size } }`);
  let allValid = true;

  let payload = {
    success: false,
    errors: [],
    quotaError: null
  }

  let uploads = [];
  let totalUploadSize = 0.0;
  let totalDocSize = 0.0;
  for (let i = 0; i < args.files.length; i++) {
    const document = args.files[i];
    const dryRunPayload = await uploadFileDryRun(user, document.file, document.filetype, document.size, document.mimetype, document.name);
    if (!dryRunPayload.success) {
      allValid = false;
      const error = {
        fieldId: document.fieldId,
        message: dryRunPayload.error
      }
      payload.errors.push(error);
    }
    totalDocSize = dryRunPayload.totaldocsize;
    totalUploadSize += document.size;
    const upload = {
      file: document.file,
      username: user.username,
      name: document.name,
      filetype: document.filetype,
      mimetype: document.mimetype,
      filename: document.filename,
      size: document.size
    }
    uploads.push(upload);
  }

  if (allValid && (totalUploadSize + totalDocSize) > userDocQuota) {
    allValid = false;
    payload.quotaError = {
      uploadSize: totalUploadSize,
      remaining: (userDocQuota - totalDocSize)
    }
  }

  if (allValid) {
    const uploadResult = await multipleUpload(uploads);
    for (let i = 0; i < uploadResult.length; i++) {
      const file = uploadResult[i];
      const path = `/uploads/${user.username}/${file.storedName}`;
      await ctx.db.mutation.createFile({
        data: {
          name: file.name,
          filetype: file.filetype,
          filename: file.filename,
          path,
          storedName: file.storedName,
          mimetype: file.mimetype,
          size: file.size,
          user: { connect: { id: userId } }
        }
      }, `{ id }`);
    }
    payload.success = true;
  } else {
    for (let i = 0; i < uploads.length; i++) {
      const upload = uploads[i];
      closeStream(upload)
      .catch(error => {
        if (streamErrorRegEx.test(error.message)) {
          console.log('Stream closed as expected');
        } else {
          console.error('Caught unexpected error:', error.message);
        }
      });
    }
  }

  return payload;
}

async function uploadFileDryRun(user, file, filetype, size, mimetype, name) {
  let payload = {
    success: false,
    error: null,
    totaldocsize: 0.0
  }

  if (!file) {
    payload.error = 'File is required for upload.';
    return payload;
  }

  if (name === '') {
    payload.error = 'Please enter a name for the document.';
    return payload;
  }

  const isValidImage = isValidImageRegEx.test(mimetype);
  const isValidDoc = isValidDocRegEx.test(mimetype);

  if (filetype === 'PROFILEIMAGE' && size > maxImageSize) {
    payload.error = 'Image size cannot exceed 500 KB.';
    return payload;
  }

  if (filetype !== 'PROFILEIMAGE' && size > maxDocSize) {
    payload.error = 'Document size cannot exceed 5 MB.';
    return payload;
  }

  if (filetype === 'PROFILEIMAGE' && !isValidImage) {
    payload.error = 'Image type must be jpg, jpeg, or png.';
    return payload;
  }

  if (filetype !== 'PROFILEIMAGE' && !isValidDoc) {
    payload.error = 'Document must be a pdf.';
    return payload;
  }

  for (let i = 0; i < user.files.length; i++) {
    const existingFile = user.files[i];
    payload.totaldocsize += existingFile.size;
    if (filetype !== 'PROFILEIMAGE' && existingFile.name === name) {
      payload.error = 'Document with this name already exists. Please rename the document, or delete the existing document.';
      payload.totaldocsize = 0.0;
      return payload;
    }
  }

  payload.success = true;
  return payload;
}

//TODO: perform error checking
async function createJobPosting(parent, args, ctx, info) {

  var currentdate = new Date();
  var dd = currentdate.getDate();
  var mm = currentdate.getMonth() + 1;
  var yyyy = currentdate.getFullYear();
  currentdate = yyyy + '-' + mm + '-' + dd;

  const posting = await ctx.db.mutation.createJobPosting({
    data: {
      title: args.title,
      type: args.type,
      duration: args.duration,
      openings: args.openings,
      description: args.description,
      contactname: args.contactname,
      salary: args.salary,
      deadline: args.deadline,
      location: null

    },
  }, `{ id }`);

  let payload = {
    jobposting: posting,
    errors: null
  }
  return payload;
}


async function fileDelete(parent, args, ctx, info) {
  const filePath = `../public${args.path}`
  if (fs.existsSync(filePath)) fs.unlinkSync(filePath);

  return await ctx.db.mutation.deleteFile({
    where: { path: args.path }
  }, `{ id }`);
}

async function renameFile(parent, args, ctx, info) {
  const userId = getUserId(ctx);
  const user = await ctx.db.query.user({ where: { id: userId } }, `{ id files { id name path } }`);

  let payload = {
    success: false,
    error: null
  }

  for (let i = 0; i < user.files.length; i++) {
    const existingFile = user.files[i];
    if (existingFile.path !== args.path && existingFile.name === args.name) {
      payload.error = 'Document with this name already exists.';
      return payload;
    }
  }

  await ctx.db.mutation.updateFile({
    data: {
      name: args.name
    },
    where: {path: args.path}
  }, `{ id }`);

  payload.success = true;
  return payload;
}

async function createApplication(parent, args, ctx, info) {
  //get userid
  const userId = getUserId(ctx);
  //from userid, query for userprofileid
  const userProfileID = await ctx.db.query.user({ where: { id: userId} }, `{ userprofile {id}}`);


  const newapplication = await ctx.db.mutation.createApplication({
    data: {
      status: 'PENDING',
      //connect to userprofileID
      user: { connect: { id: userProfileID.userprofile.id } },
      jobposting: { connect: { id: args.jobpostingid}}
    }
  })

  let payload = {
    application: newapplication
  }

  return payload;
}

async function updatebusinessuser(parent, args, ctx, info) {
  const userId = getUserId(ctx);
  const businessProfileID = await ctx.db.query.user({ where: { id: userId} }, `{ businessprofile {id}}`);
  
  var payload = {
    user: null,
  }

  await ctx.db.mutation.updateBusinessProfile({
    data: {
      name: args.name,
      description: args.description,
      phonenumber: args.phonenumber,
      address: args.address,
      website: args.website
    },
    where: {id: businessProfileID.businessprofile.id}
  }, `{ id }`);
  payload.user =  await ctx.db.mutation.updateUser({
    data: {
      username: args.username,
      email: args.email
    },
    where: {id: userId}
  }, `{ id username }`);


  return payload;
}

const Mutation = {
  signup,
  login,
  updateuser,
  uploadFile,
  createJobPosting,
  updatePassword,
  fileDelete,
  uploadFiles,
  createApplication,
  renameFile,
  updatebusinessuser
}

module.exports = {
  Mutation
}
