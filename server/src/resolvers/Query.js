
const {forwardTo} = require('prisma-binding');
const {getUserId} = require('../utils');

async function me (parent, args, ctx, info) {
  const id = getUserId(ctx);
  return ctx.db.query.user({ where: { id } }, info);
}

async function users(parent, args, ctx, info) {
  const { where } = args;
  const users = await ctx.db.query.users({ where }, info);

  return users;
}

async function jobpostings(parent, args, ctx, info) {
  const { where } = args;
  const jobpostings = await ctx.db.query.jobPostings({ where }, info);

  return jobpostings;
}

const Query = {
  me,
  users,
  jobpostings,
  user: (parent, args, ctx, info) => {
    return forwardTo('db')(parent, args, ctx, info);
  },
  jobPosting: (parent, args, ctx, info)=>{
    return forwardTo('db')(parent, args, ctx, info);
  }
}

module.exports = {
  Query
}
