const { GraphQLServer } = require('graphql-yoga');
const { Prisma } = require('prisma-binding');
const resolvers = require('./resolvers')

require('dotenv').config();

const server = new GraphQLServer({
  typeDefs: './src/schema.graphql',
  resolvers,
  context: req => ({
    ...req,
    db: new Prisma({
      typeDefs: 'src/generated/prisma.graphql',
      endpoint: 'http://localhost:4466',
      secret: process.env.PRISMA_MANAGEMENT_API_SECRET,
      debug: true,
    }),
  }),
});

server.express.get(server.options.endpoint + 'user', (req, res, done) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({
    message: 'Message from graphql-yoga (Express API)',
    obj: 'You can use graphql-yoga as a simple REST API'
  })
});

server.start(() => console.log(`Server is running on http://localhost:4000`));
