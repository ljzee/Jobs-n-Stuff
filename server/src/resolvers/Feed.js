function users(parent, args, context, info) {
  const { userIds } = parent
  return context.db.query.users({ where: { id_in: userIds } }, info)
}

function jobpostings(parent, args, context, info) {
  const { jobPostingIds } = parent
  return context.db.query.jobPostings({ where: { id_in: jobPostingIds} }, info)
}

const Feed = {
  users,
  jobpostings
}
module.exports = {
  Feed
}
