import { gql } from '@apollo/client';

// Get all tags for filtering
export const GET_TAGS = gql`
  query GetTags {
    tags {
      id
      name
      slug
      color
    }
  }
`;

// Get single tag
export const GET_TAG = gql`
  query GetTag($slug: String!) {
    tag(slug: $slug) {
      id
      name
      slug
      description
      color
      createdAt
    }
  }
`;