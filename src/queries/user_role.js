import gql from 'graphql-tag';

export default gql`
  query UserQuery($where: UserWhereUniqueInput!) {
    user(where: $where) {
      role
    }
  }
`