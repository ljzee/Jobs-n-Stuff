const { Prisma } = require('prisma-binding');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

require('dotenv').config();

const prisma_secret = process.env.PRISMA_MANAGEMENT_API_SECRET;

const prisma = new Prisma({
  typeDefs: 'src/generated/prisma.graphql',
  endpoint: 'http://localhost:4466',
  secret: prisma_secret
});

async function deleteExistingUser(email) {
  let delete_user = await prisma.query.user({ where: { email: email } }, `{ id }`);
  if (delete_user === null) {
    process.stdout.write('User with email ' + email + ' does not exist. Nothing to delete.\n');
  } else {
    await prisma.mutation.deleteUser(
      { where: { email: email } },
      "{ id }"
    );
    process.stdout.write('User with email ' + email + ' has been deleted.\n');
  }
}

async function createNewUser(username, email, password, role, activated, avatar=null, userProfile=null, businessProfile=null, location=null, deleteUser=false) {
  if (deleteUser) {
    await deleteExistingUser(email);
  }
  const hashed_pass = await bcrypt.hash(password, 10);
  let user1 = await prisma.query.user({ where: { email: email } }, `{ id }`);
  let user2 = await prisma.query.user({ where: { username: username } }, `{ id }`);
  if (user1 === null && user2 === null) {
    const resetPasswordToken = crypto.randomBytes(64).toString('hex');
    const validateEmailToken = crypto.randomBytes(64).toString('hex');
    const user = await prisma.mutation.createUser({
      data: {
        username: username,
        email: email,
        password: hashed_pass,
        role: role,
        activated: activated,
        admindeactivated: false,
        resetPasswordToken,
        validateEmailToken
      } },
      "{ id }"
    );
    if (role === 'BASEUSER') {
      await prisma.mutation.createUserProfile({
        data: {
          firstname: userProfile.firstname,
          lastname: userProfile.lastname,
          preferredname: userProfile.preferredname,
          phonenumber:userProfile.phonenumber,
          user: { connect: { id: user.id } }
        },
      }, `{ id }`);
    }
    if (role === 'BUSINESS') {
      const bProfile = await prisma.mutation.createBusinessProfile({
        data: {
          name: businessProfile.name,
          description: businessProfile.description,
          phonenumber: businessProfile.phonenumber,
          website: businessProfile.website,
          user: { connect: { id: user.id } }
        },
      }, `{ id }`);
      await prisma.mutation.createLocation({
        data: {
          city: location.city,
          region: location.region,
          country: location.country,
          postalcode: location.postalcode,
          address: location.address,
          businessprofile: { connect: { id: bProfile.id } }
        },
      }, `{ id }`);
    }
    if (role !== 'ADMIN') {
      await prisma.mutation.createFile({
        data: {
          filetype: avatar.filetype,
          filename: avatar.filename,
          path: avatar.path,
          storedName: avatar.storedname,
          mimetype: avatar.mimetype,
          user: { connect: { id: user.id } }
        }
      }, `{ id }`);
    }
    process.stdout.write('New user with username \'' + username + '\' and email \'' + email + '\' created.\n');
  } else if (user1 !== null && user2 === null) {
    process.stdout.write('User with email \'' + email + '\' already exists.\n');
  } else if (user1 === null && user2 !== null) {
    process.stdout.write('User with username \'' + username + '\' already exists.\n');
  }
  else {
    process.stdout.write('User already exists. Nothing to create.\n');
  }
}

// Create admin user
const admin_username = 'admin';
const admin_email = 'admin@email.com';
const admin_password = 'password';
const admin_role = 'ADMIN';
const admin_activated = true;
createNewUser(admin_username, admin_email, admin_password, admin_role, admin_activated);

// Create business user's
let business_username = 'business';
let business_email = 'business@email.com';
let business_password = 'password';
let business_role = 'BUSINESS';
let business_activated = true;
let business_profile = {
  name: 'ACME',
  description: 'We are a small business that provides tons of fake services for our customers.',
  phonenumber: '(456) 789-1234',
  website: 'https://www.google.com/'
}
let location = {
  city: 'Vancouver',
  region: 'British Columbia',
  country: 'Canada',
  postalcode: 'T8H1N6',
  address: '123 Fake Street'
}
let avatar = {
  filetype: 'PROFILEIMAGE',
  filename: 'business_avatar.png',
  path: '/uploads/business/business_avatar.png',
  storedname: 'business_avatar.png',
  mimetype: 'image/png'
}
createNewUser(business_username, business_email, business_password, business_role, business_activated, avatar, null, business_profile, location);
business_username = 'cyber';
business_email = 'cyber@email.com';
business_password = 'password';
business_role = 'BUSINESS';
business_activated = true;
business_profile = {
  name: 'Cyberlife',
  description: 'We are a cyber business that does lots of cyber stuff.',
  phonenumber: '(123) 456-7890',
  website: 'https://github.com/'
}
location = {
  city: 'Burnaby',
  region: 'British Columbia',
  country: 'Canada',
  postalcode: 'V5C6N4',
  address: '123 Fake Ave'
}
avatar = {
  filetype: 'PROFILEIMAGE',
  filename: 'cyber_avatar.png',
  path: '/uploads/cyber/cyber_avatar.png',
  storedname: 'cyber_avatar.png',
  mimetype: 'image/png'
}
createNewUser(business_username, business_email, business_password, business_role, business_activated, avatar, null, business_profile, location);

// Create base user
let base_username = 'testguy';
let base_email = 'baseuser@email.com';
let base_password = 'password';
let base_role = 'BASEUSER';
let base_activated = true;
let base_profile = {
  firstname: 'Test',
  lastname: 'Guy',
  phonenumber: '(789) 555-5555'
}
avatar = {
  filetype: 'PROFILEIMAGE',
  filename: 'testguy_avatar.png',
  path: '/uploads/testguy/testguy_avatar.png',
  storedname: 'testguy_avatar.png',
  mimetype: 'image/png'
}
createNewUser(base_username, base_email, base_password, base_role, base_activated, avatar, base_profile);
