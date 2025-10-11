import { ApolloClient, InMemoryCache } from '@apollo/client'
import { SchemaLink } from '@apollo/client/link/schema'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { resolvers } from './resolvers'
import schemaSDL from './schema.graphql?raw'

const schema = makeExecutableSchema({ typeDefs: schemaSDL, resolvers })

export const apolloClient = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      Suggestion: { keyFields: ['id'] },
      Query: { fields: {
        suggestions: { keyArgs: ['q','status','category','employeeId','priority'] }
      } }
    },
  }),
  link: new SchemaLink({ schema }),
})