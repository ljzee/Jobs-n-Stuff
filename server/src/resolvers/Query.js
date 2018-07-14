
const {forwardTo} = require('prisma-binding');
const {getUserId} = require('../utils');

async function me (parent, args, ctx, info) {
  const id = getUserId(ctx);
  return ctx.db.query.user({ where: { id } }, info);
}

const Query = {
  me,
  user: (parent, args, ctx, info) => {
    return forwardTo('db')(parent, args, ctx, info);
  }
}

module.exports = {
  Query
}
