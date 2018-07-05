const { Prisma } = require('prisma-binding');

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

async function createNewUser(username, email, password, role) {
  let user1 = await prisma.query.user({ where: { email: email } }, `{ id }`);
  let user2 = await prisma.query.user({ where: { username: username } }, `{ id }`);
  if (user1 === null && user2 === null) {
    await prisma.mutation.createUser({
      data: {
        username: username ,
        email: email,
        password: password,
        role: role
      } },
      "{ id }"
    );
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
const admin_password = '$2a$10$FkZHDHH779ZCxdFYjdMWPuLvUNbJm9vRHg/po6q4J7g2sH6uC29V6' // Password: 'admin_password'
const admin_role = 'ADMIN'
createNewUser(admin_username, admin_email, admin_password, admin_role);
