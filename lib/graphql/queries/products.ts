import { gql } from '@apollo/client';

// Home page - only essential product fields
export const GET_HOME_PRODUCTS = gql`
  query GetHomeProducts($filters: ProductFilters) {
    products(filters: $filters) {
      data {
        id
        slug
        name
        brand_id
        category
        sub_category
        image_url
        package_size_g
        price_gbp
        price_per_kg_gbp
        overall_score
        is_sponsored
        sponsored_priority
        discount_code
        discount_description
        brand {
          id
          name
          slug
          country_of_origin
        }
        tags {
          id
          name
          slug
          color
        }
      }
      total
      page
      limit
      totalPages
    }
  }
`;

// Product detail page - all fields needed
export const GET_PRODUCT_DETAIL = gql`
  query GetProductDetail($slug: String!) {
    product(slug: $slug) {
      id
      slug
      name
      category
      subCategory
      imageUrl
      packageSizeG
      priceGbp
      pricePerKgGbp

      # Nutritional data
      proteinPercent
      fatPercent
      fiberPercent
      ashPercent
      moisturePercent
      carbsPercent
      caloriesPer100g

      # Ingredients
      ingredientsRaw
      ingredientsList
      meatContentPercent
      hasArtificialAdditives
      hasFillers

      # Scoring
      overallScore
      ingredientScore
      nutritionScore
      valueScore
      scoringBreakdown

      # Metadata
      isAvailable
      isSponsored
      affiliateUrl
      discountCode
      discountDescription

      # SEO
      metaTitle
      metaDescription

      # Relations
      brand {
        id
        slug
        name
        logoUrl
        websiteUrl
        countryOfOrigin
        overallScore
      }
      tags {
        id
        name
        slug
        color
      }

      createdAt
      updatedAt
    }
  }
`;

// Brand page - products by brand
export const GET_PRODUCTS_BY_BRAND = gql`
  query GetProductsByBrand($brandSlug: String!, $filters: ProductFilters) {
    productsByBrand(brandSlug: $brandSlug, filters: $filters) {
      brand {
        id
        slug
        name
        logoUrl
        websiteUrl
        countryOfOrigin
        description
        overallScore
        totalProducts
        metaTitle
        metaDescription
      }
      products {
        id
        slug
        name
        category
        imageUrl
        priceGbp
        overallScore
        isAvailable
        isSponsored
      }
      totalProducts
    }
  }
`;

// Search results - minimal fields for performance
export const SEARCH_PRODUCTS = gql`
  query SearchProducts($query: String!, $filters: ProductFilters) {
    searchProducts(query: $query, filters: $filters) {
      data {
        id
        slug
        name
        category
        imageUrl
        priceGbp
        overallScore
        brand {
          id
          name
          slug
        }
      }
      total
      page
      limit
      totalPages
    }
  }
`;