import { gql } from '@apollo/client';

// Combined search for header search
export const SEARCH_ALL = gql`
  query SearchAll($query: String!) {
    searchProducts(query: $query, filters: { limit: 5 }) {
      data {
        id
        slug
        name
        category
        brand {
          name
        }
      }
    }
    searchBrands(query: $query) {
      id
      slug
      name
      totalProducts
    }
  }
`;