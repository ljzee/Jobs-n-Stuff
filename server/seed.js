const { Prisma } = require('prisma-binding');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
/*
Code below is from:
  https://stackoverflow.com/questions/563406/add-days-to-javascript-date
By sparebytes
*/
function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
/* End of referenced code */

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

async function createNewUser(username, email, password, role, activated, avatar=null, userProfile=null, businessProfile=null, location=null, deleteUser=false, jobPostings=null) {
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
          phonenumber: userProfile.phonenumber,
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

      if (jobPostings !== null) {
        jobPostings.forEach(async (posting) => {
          const jPosting = await prisma.mutation.createJobPosting({
            data: {
              deadline: posting.deadline,
              title: posting.title,
              type: posting.type,
              openings: posting.openings,
              description: posting.description,
              contactname: posting.contactname,
              paytype: posting.paytype,
              salary: posting.salary,
              coverletter: posting.coverletter,
              activated: posting.activated,
              duration: posting.duration,
              businessprofile: { connect: { id: bProfile.id } }
            }
          }, `{ id }`);

          await prisma.mutation.createLocation({
            data: {
              city: posting.location.city,
              region: posting.location.region,
              country: posting.location.country,
              jobposting: { connect: { id: jPosting.id } }
            },
          }, `{ id }`);

        });
      }
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
let job_postings = [{
  deadline: addDays(new Date(Date.now()), 30),
  title: 'Project Manager',
  type: 'FULLTIME',
  location: {
    country: 'United States',
    region: 'Washington',
    city: 'Seattle'
  },
  description: 'We are seeking an effective leader to shape the future of our products.',
  contactname: 'Arthur Cartwright',
  openings: 1,
  salary: 81250.00,
  coverletter: true,
  paytype: 'SALARY',
  activated: true
}, {
  deadline: addDays(new Date(Date.now()), 7),
  title: 'Sales Manager',
  type: 'FULLTIME',
  location: {
    country: 'United States',
    region: 'Michigan',
    city: 'Detroit'
  },
  description: 'We are seeking an effective leader to market our products.',
  contactname: 'Jessica Able',
  openings: 1,
  salary: 62000.00,
  coverletter: true,
  paytype: 'SALARY',
  activated: true
}, {
  deadline: addDays(new Date(Date.now()), 1),
  title: 'Accounting Assistant',
  type: 'FULLTIME',
  location: {
    country: 'Canada',
    region: 'Ontario',
    city: 'Toronto'
  },
  description: 'Looking for part time accounting assistants to aid in our recent transitions.',
  contactname: 'Jason Wong',
  openings: 5,
  duration: 8,
  salary: 27.00,
  coverletter: true,
  paytype: 'HOURLY',
  activated: true
}, {
  deadline: addDays(new Date(Date.now()), 20),
  title: 'Property Administrator',
  type: 'FULLTIME',
  location: {
    country: 'Canada',
    region: 'Quebec',
    city: 'Quebec'
  },
  description: 'Be the first point of contact for tenant inquiries and maintenance requests and complete the relevant documents for such requests.',
  contactname: 'Guy Forester',
  openings: 1,
  duration: 10,
  salary: 65000.00,
  coverletter: true,
  paytype: 'SALARY',
  activated: true
}, {
  deadline: addDays(new Date(Date.now()), 6),
  title: 'Software Developer',
  type: 'FULLTIME',
  location: {
    country: 'Canada',
    region: 'British Columbia',
    city: 'Vancouver'
  },
  description: 'Help us improve and develop software for our clients.',
  contactname: 'Samantha James',
  salary: 58000.00,
  coverletter: true,
  paytype: 'SALARY',
  activated: true
}];

let avatar = {
  filetype: 'PROFILEIMAGE',
  filename: 'business_avatar.png',
  path: '/uploads/business/business_avatar.png',
  storedname: 'business_avatar.png',
  mimetype: 'image/png'
}
createNewUser(business_username, business_email, business_password, business_role, business_activated, avatar, null, business_profile, location, null, job_postings);
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

job_postings = [{
  deadline: addDays(new Date(Date.now()), 16),
  title: 'Software Engineer',
  type: 'FULLTIME',
  location: {
    country: 'Canada',
    region: 'British Columbia',
    city: 'Vancouver'
  },
  description: 'We are looking for individuals who have a solid background in developing software.',
  contactname: 'Imogen Reed',
  openings: 3,
  salary: 72000.00,
  coverletter: true,
  paytype: 'SALARY',
  activated: true
}, {
  deadline: addDays(new Date(Date.now()), 5),
  title: 'Secretary',
  type: 'FULLTIME',
  location: {
    country: 'Canada',
    region: 'British Columbia',
    city: 'Richmond'
  },
  description: 'We need someone to answer phone calls, book appointments, and direct visitors.',
  contactname: 'John Doe',
  openings: 1,
  salary: 53000.00,
  coverletter: true,
  paytype: 'SALARY',
  activated: true
}, {
  deadline: addDays(new Date(Date.now()), 10),
  title: 'Assistant Secretary',
  type: 'PARTTIME',
  location: {
    country: 'Canada',
    region: 'British Columbia',
    city: 'Richmond'
  },
  description: 'We need someone to help with answering phone calls, booking appointments, and directing visitors.',
  contactname: 'Jane Doe',
  openings: 2,
  duration: 24,
  salary: 24.00,
  coverletter: true,
  paytype: 'HOURLY',
  activated: true
}, {
  deadline: addDays(new Date(Date.now()), 3),
  title: 'QA Analyst',
  type: 'FULLTIME',
  location: {
    country: 'Canada',
    region: 'British Columbia',
    city: 'New Westminster'
  },
  description: 'We\'re looking for people that are good at finding bugs in software.',
  contactname: 'John Doe',
  openings: 2,
  salary: 60000.00,
  coverletter: true,
  paytype: 'SALARY',
  activated: true
}, {
  deadline: addDays(new Date(Date.now()), 17),
  title: 'Senior Network Specialist',
  type: 'FULLTIME',
  location: {
    country: 'Canada',
    region: 'British Columbia',
    city: 'Burnaby'
  },
  description: 'This postition requires the individual to ensure the optimized performance, integrity, and security of all network access points and network systems, including but not limited to, firewalls, DMZ, external DNS, switches, routers, VoIP, wireless, remote access, video conferencing, and unified communication applications.',
  contactname: 'John Doe',
  salary: 91000.00,
  coverletter: true,
  paytype: 'SALARY',
  activated: true
}];

avatar = {
  filetype: 'PROFILEIMAGE',
  filename: 'cyber_avatar.png',
  path: '/uploads/cyber/cyber_avatar.png',
  storedname: 'cyber_avatar.png',
  mimetype: 'image/png'
}
createNewUser(business_username, business_email, business_password, business_role, business_activated, avatar, null, business_profile, location, null, job_postings);

// Create base user
let base_username = 'testguy';
let base_email = 'baseuser@email.com';
let base_password = 'password';
let base_role = 'BASEUSER';
let base_activated = true;
let base_profile = {
  firstname: 'Test',
  lastname: 'Guy',
  preferredname: '',
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
