import { makeExecutableSchema } from '@graphql-tools/schema';
import { graphql } from 'graphql';
import { typeDefs } from '../../../lib/graphql/schema';
import { resolvers } from '../../../lib/graphql/resolvers';

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

export async function POST(request: Request) {
  try {
    const { query, variables } = await request.json();

    console.log('========================================');
    console.log('GraphQL Route - Received request');
    console.log('Query:', query.substring(0, 100) + '...');
    console.log('Variables:', JSON.stringify(variables, null, 2));
    console.log('========================================');

    const result = await graphql({
      schema,
      source: query,
      variableValues: variables,
    });

    console.log('GraphQL Route - Result:', {
      hasData: !!result.data,
      hasErrors: !!result.errors,
      errors: result.errors?.map(e => ({ message: e.message, path: e.path }))
    });

    return Response.json(result);
  } catch (error) {
    console.error('GraphQL Error:', error);
    return Response.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
