import { gql } from 'graphql-tag';

// GraphQL Schema Definition
export const typeDefs = gql`
  scalar DateTime
  scalar JSON

  type Brand {
    id: ID!
    slug: String!
    name: String!
    logo_url: String
    website_url: String
    country_of_origin: String
    description: String
    scrape_source_url: String
    overall_score: Float
    total_products: Int!
    is_featured: Boolean!
    is_sponsored: Boolean!
    sponsored_priority: Int
    meta_title: String
    meta_description: String
    created_at: DateTime!
    updated_at: DateTime!
  }

  type Tag {
    id: ID!
    name: String!
    slug: String!
    description: String
    color: String!
    created_at: DateTime!
  }

  type ScoringBreakdown {
    ingredient_score: Float!
    nutrition_score: Float!
    value_score: Float!
    details: JSON
  }

  type Product {
    id: ID!
    slug: String!
    name: String!
    brand_id: String
    brand: Brand
    tags: [Tag!]!

    # Product details
    category: String!
    sub_category: String
    image_url: String
    package_size_g: Float
    price_gbp: Float
    price_per_kg_gbp: Float

    # Nutritional data
    protein_percent: Float
    fat_percent: Float
    fiber_percent: Float
    ash_percent: Float
    moisture_percent: Float
    carbs_percent: Float
    calories_per_100g: Float

    # Ingredients
    ingredients_raw: String
    ingredients_list: [String!]
    meat_content_percent: Float

    # Scoring
    overall_score: Float
    ingredient_score: Float
    nutrition_score: Float
    value_score: Float
    scoring_breakdown: ScoringBreakdown

    # Metadata
    scrape_source_url: String
    last_scraped_at: DateTime
    is_available: Boolean!
    is_sponsored: Boolean!
    sponsored_priority: Int
    affiliate_url: String
    discount_code: String
    discount_description: String

    # SEO
    meta_title: String
    meta_description: String

    # Timestamps
    created_at: DateTime!
    updated_at: DateTime!
  }

  type Article {
    id: ID!
    slug: String!
    title: String!
    excerpt: String
    content: String
    featuredImageUrl: String
    category: String!
    author: String!
    isPublished: Boolean!
    publishedAt: DateTime
    metaTitle: String
    metaDescription: String
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  type Comparison {
    id: ID!
    slug: String!
    productIds: [String!]!
    viewCount: Int!
    createdAt: DateTime!
  }

  type PaginatedProducts {
    data: [Product!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  type PaginatedBrands {
    data: [Brand!]!
    total: Int!
    page: Int!
    limit: Int!
    totalPages: Int!
  }

  type ProductsByBrand {
    brand: Brand!
    products: [Product!]!
    totalProducts: Int!
  }

  input ProductFilters {
    category: String
    brandId: String
    minScore: Float
    maxScore: Float
    minPrice: Float
    maxPrice: Float
    subCategory: String
    isGrainFree: Boolean
    highProtein: Boolean
    search: String
    sort: String
    page: Int
    limit: Int
    priceRange: String
    minScoreFilter: String
    brands: [String!]
    lifeStage: String
    breedSize: String
    specialDiet: [String!]
  }

  input BrandFilters {
    search: String
    sort: String
    page: Int
    limit: Int
    isFeatured: Boolean
    isSponsored: Boolean
  }

  type Query {
    # Products
    products(filters: ProductFilters): PaginatedProducts!
    product(slug: String!): Product
    productsByBrand(brandSlug: String!, filters: ProductFilters): ProductsByBrand!

    # Brands
    brands(filters: BrandFilters): PaginatedBrands!
    brand(slug: String!): Brand
    featuredBrands: [Brand!]!

    # Search
    searchProducts(query: String!, filters: ProductFilters): PaginatedProducts!
    searchBrands(query: String!): [Brand!]!

    # Tags
    tags: [Tag!]!
    tag(slug: String!): Tag

    # Articles/Content
    articles: [Article!]!
    article(slug: String!): Article

    # Comparisons
    comparisons: [Comparison!]!
    comparison(slug: String!): Comparison
  }

  type Mutation {
    # Admin operations (if needed)
    updateProduct(id: ID!, input: JSON!): Product
    updateBrand(id: ID!, input: JSON!): Brand
  }
`;