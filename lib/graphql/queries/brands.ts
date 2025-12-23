import { gql } from '@apollo/client';

// Brands list page - essential fields only
export const GET_BRANDS = gql`
  query GetBrands($filters: BrandFilters) {
    brands(filters: $filters) {
      data {
        id
        slug
        name
        logo_url
        country_of_origin
        overall_score
        total_products
        is_featured
        is_sponsored
      }
      total
      page
      limit
      totalPages
    }
  }
`;

// Brand detail page - all fields needed
export const GET_BRAND_DETAIL = gql`
  query GetBrandDetail($slug: String!) {
    brand(slug: $slug) {
      id
      slug
      name
      logo_url
      website_url
      country_of_origin
      description
      scrape_source_url
      overall_score
      total_products
      is_featured
      is_sponsored
      sponsored_priority
      meta_title
      meta_description
      created_at
      updated_at
    }
  }
`;

// Featured brands for home page
export const GET_FEATURED_BRANDS = gql`
  query GetFeaturedBrands {
    featuredBrands {
      id
      slug
      name
      logo_url
      overall_score
      total_products
    }
  }
`;

// Brand search
export const SEARCH_BRANDS = gql`
  query SearchBrands($query: String!) {
    searchBrands(query: $query) {
      id
      slug
      name
      logo_url
      overall_score
      total_products
    }
  }
`;