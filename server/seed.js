const { Prisma } = require('prisma-binding');
const bcrypt = require('bcryptjs');

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

async function createNewUser(username, email, password, role, activated, deleteUser=false) {
  if (deleteUser) {
    await deleteExistingUser(email);
  }
  const hashed_pass = await bcrypt.hash(password, 10);
  let user1 = await prisma.query.user({ where: { email: email } }, `{ id }`);
  let user2 = await prisma.query.user({ where: { username: username } }, `{ id }`);
  if (user1 === null && user2 === null) {
    const user = await prisma.mutation.createUser({
      data: {
        username: username,
        email: email,
        password: hashed_pass,
        role: role,
        activated: activated,
      } },
      "{ id }"
    );
    if (role === 'BASEUSER') {
      await prisma.mutation.createUserProfile({
        data: {
          firstname: '',
          lastname: '',
          preferredname: '',
          phonenumber: '',
          user: { connect: { id: user.id } }
        },
      }, `{ id }`);
    }
    if (role === 'BUSINESS') {
      await prisma.mutation.createBusinessProfile({
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
const admin_password = 'admin_password';
const admin_role = 'ADMIN';
const admin_activated = true;
createNewUser(admin_username, admin_email, admin_password, admin_role, admin_activated);

// Create business user
const business_username = 'business';
const business_email = 'business@email.com';
const business_password = 'business_password';
const business_role = 'BUSINESS';
const business_activated = true;
createNewUser(business_username, business_email, business_password, business_role, business_activated);

// Create base user
const base_username = 'baseuser';
const base_email = 'baseuser@email.com';
const base_password = 'base_password';
const base_role = 'BASEUSER';
const base_activated = true;
createNewUser(base_username, base_email, base_password, base_role, base_activated);
