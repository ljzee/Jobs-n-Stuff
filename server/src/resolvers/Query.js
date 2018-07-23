
const {forwardTo} = require('prisma-binding');
const {getUserId} = require('../utils');

async function me (parent, args, ctx, info) {
  const id = getUserId(ctx);
  return ctx.db.query.user({ where: { id } }, info);
}

async function feed(parent, args, ctx, info) {
  const { filter, first, skip } = args // destructure input arguments
  const where = filter
    ? { OR: [{ username_contains: filter }, { email_contains: filter }] }
    : {}

  const allUsers = await ctx.db.query.users({})
  const count = allUsers.length

  const queriedUsers = await ctx.db.query.users({ first, skip, where })

  return {
    userIds: queriedUsers.map(user => user.id),
    count
  }
}

const Query = {
  me,
  feed,
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
