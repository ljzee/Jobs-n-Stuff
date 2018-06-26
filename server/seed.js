const { Prisma } = require('prisma-binding')

const prisma = new Prisma({
  typeDefs: 'src/generated/prisma.graphql',
  endpoint: 'http://localhost:4466',
  secret: process.env.PRISMA_MANAGEMENT_API_SECRET
})

prisma.mutation.createUser({
  data: {
    name: "Admin" ,
    email: "admin@email.com",
    password: "$2a$10$FkZHDHH779ZCxdFYjdMWPuLvUNbJm9vRHg/po6q4J7g2sH6uC29V6",
    role: 'ADMIN'} },
  "{ id }"
)
