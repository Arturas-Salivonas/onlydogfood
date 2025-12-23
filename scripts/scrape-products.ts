#!/usr/bin/env node

/**
 * Product Scraper Script for AllAboutDogFood.co.uk
 * Scrapes product data from allaboutdogfood.co.uk
 *
 * Usage: npm run scrape:products [limit]
 * Example: npm run scrape:products 2 (scrapes first 2 products)
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import type { Browser } from 'puppeteer';
import { getServiceSupabase } from '../lib/supabase';
import { calculateOverallScore } from '../scoring/calculator';
import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';

// Add stealth plugin
puppeteer.use(StealthPlugin());

interface ProductData {
  name: string;
  slug: string;
  brand_id?: string;
  brand_name?: string;
  category: 'dry' | 'wet' | 'snack';
  sub_category?: string;
  image_url?: string;
  package_size_g?: number;
  price_gbp?: number;
  protein_percent?: number;
  fat_percent?: number;
  fiber_percent?: number;
  ash_percent?: number;
  moisture_percent?: number;
  calcium_percent?: number;
  phosphorus_percent?: number;
  omega3_percent?: number;
  omega6_percent?: number;
  calories_per_100g?: number;
  ingredients_raw?: string;
  scrape_source_url?: string;
}

class ProductScraper {
  private browser: Browser | null = null;
  private supabase = getServiceSupabase();
  private imageDir = path.join(process.cwd(), 'public', 'products');

  async initialize(): Promise<void> {
    // Ensure image directory exists
    if (!fs.existsSync(this.imageDir)) {
      fs.mkdirSync(this.imageDir, { recursive: true });
    }

    this.browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-web-security',
        '--disable-features=VizDisplayCompositor'
      ]
    });
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  private generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Parse ingredients string into an array of individual ingredients
   */
  private parseIngredients(ingredientsRaw: string): string[] {
    if (!ingredientsRaw) return [];

    // Split on commas, but be smart about percentages in parentheses
    const ingredients: string[] = [];
    let currentIngredient = '';
    let parenthesesDepth = 0;

    for (let i = 0; i < ingredientsRaw.length; i++) {
      const char = ingredientsRaw[i];

      if (char === '(') {
        parenthesesDepth++;
        currentIngredient += char;
      } else if (char === ')') {
        parenthesesDepth--;
        currentIngredient += char;
      } else if (char === ',' && parenthesesDepth === 0) {
        // Only split on commas outside of parentheses
        if (currentIngredient.trim()) {
          ingredients.push(currentIngredient.trim());
        }
        currentIngredient = '';
      } else {
        currentIngredient += char;
      }
    }

    // Add the last ingredient
    if (currentIngredient.trim()) {
      ingredients.push(currentIngredient.trim());
    }

    return ingredients;
  }

  private async downloadImage(url: string, filename: string): Promise<string | null> {
    try {
      if (!this.browser) throw new Error('Browser not initialized');

      const filePath = path.join(this.imageDir, filename);

      // Use Puppeteer to download image to bypass anti-bot protection (403 errors)
      const imagePage = await this.browser.newPage();

      try {
        const response = await imagePage.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });

        if (!response || response.status() !== 200) {
          console.log(`⚠️  Failed to load image: HTTP ${response?.status()}`);
          await imagePage.close();
          return null;
        }

        const buffer = await response.buffer();
        fs.writeFileSync(filePath, buffer);

        await imagePage.close();
        return `/products/${filename}`;

      } catch (error) {
        console.log(`⚠️  Image download error: ${error}`);
        await imagePage.close();
        return null;
      }

    } catch (error) {
      console.log(`⚠️  Failed to download image: ${error}`);
      return null;
    }
  }

  private mapCategory(typeOfFood?: string): 'dry' | 'wet' | 'snack' {
    if (!typeOfFood) return 'dry';

    const text = typeOfFood.toLowerCase();
    if (text.includes('wet') || text.includes('can') || text.includes('pouch') || text.includes('tin')) return 'wet';
    if (text.includes('treat') || text.includes('snack') || text.includes('chew') || text.includes('dental')) return 'snack';
    if (text.includes('dry')) return 'dry';
    return 'dry'; // Default to dry food
  }

  private parsePrice(priceText?: string): number | undefined {
    if (!priceText) return undefined;

    // Match various price formats: £12.99, 12.99, $12.99, etc.
    const priceMatch = priceText.match(/(?:£|\$|€)?\s*(\d+(?:\.\d{2})?)/);
    if (priceMatch) {
      return parseFloat(priceMatch[1]);
    }

    return undefined;
  }

  private parseNutritionalValue(text?: string): number | undefined {
    if (!text) return undefined;

    // Match percentages like "25%", "12.5g", etc.
    const percentMatch = text.match(/(\d+(?:\.\d+)?)\s*%/);
    if (percentMatch) {
      return parseFloat(percentMatch[1]);
    }

    const gramMatch = text.match(/(\d+(?:\.\d+)?)\s*g/);
    if (gramMatch) {
      return parseFloat(gramMatch[1]);
    }

    return undefined;
  }

  async scrapeProducts(limit?: number): Promise<ProductData[]> {
    if (!this.browser) throw new Error('Browser not initialized');

    const products: ProductData[] = [];
    const page = await this.browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.setExtraHTTPHeaders({
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.5',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0',
    });

    // Set viewport to make it look more like a real browser
    await page.setViewport({ width: 1920, height: 1080 });

    try {
      const baseUrl = 'https://www.allaboutdogfood.co.uk';
      const directoryUrl = `${baseUrl}/the-dog-food-directory`;

      console.log(`🌐 Navigating to ${directoryUrl}...`);
      await page.goto(directoryUrl, { waitUntil: 'networkidle2', timeout: 30000 });

      // Simulate human behavior
      await page.mouse.move(Math.random() * 800, Math.random() * 600);
      await page.evaluate(() => window.scrollTo(0, Math.random() * 300));
      await this.delay(2000);

      // Select "All" from the limit dropdown
      console.log('📋 Selecting "All" from limit dropdown...');
      await page.select('#limit', '99999');

      // Wait for the page to start loading
      await this.delay(2000);

      // Wait for all products to load by monitoring the number of products
      console.log('⏳ Waiting for all products to load...');
      let previousCount = 0;
      let stableCount = 0;
      let maxWaitTime = 60000; // 60 seconds max
      let startTime = Date.now();

      while (Date.now() - startTime < maxWaitTime) {
        const currentCount = await page.evaluate(() => {
          return document.querySelectorAll('.whitebox.results_table').length;
        });

        console.log(`📊 Products loaded: ${currentCount}`);

        if (currentCount === previousCount) {
          stableCount++;
          if (stableCount >= 3) { // Count stable for 3 checks (6 seconds)
            console.log(`✅ All products loaded: ${currentCount}`);
            break;
          }
        } else {
          stableCount = 0;
        }

        previousCount = currentCount;
        await this.delay(2000);
      }

      console.log('📄 Extracting product links...');

      // Extract product links
      const productLinks = await page.evaluate(() => {
        const productElements = document.querySelectorAll('.whitebox.results_table');
        const links: string[] = [];

        for (const element of productElements) {
          const link = element.querySelector('a[href*="/dog-food-reviews/"]') as HTMLAnchorElement;
          if (link?.href) {
            links.push(link.href);
          }
        }

        return links;
      });

      console.log(`🔍 Found ${productLinks.length} product links`);

      // Limit the number of products to scrape if specified
      const linksToScrape = limit ? productLinks.slice(0, limit) : productLinks;

      for (let i = 0; i < linksToScrape.length; i++) {
        const productUrl = linksToScrape[i];
        console.log(`🔍 Scraping product ${i + 1}/${linksToScrape.length}: ${productUrl}`);

        try {
          const productPage = await this.browser.newPage();
          await productPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
          await productPage.setExtraHTTPHeaders({
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0',
          });
          await productPage.setViewport({ width: 1920, height: 1080 });

          await productPage.goto(productUrl, { waitUntil: 'networkidle2', timeout: 30000 });

          // Simulate human behavior
          await productPage.mouse.move(Math.random() * 800, Math.random() * 600);
          await productPage.evaluate(() => window.scrollTo(0, Math.random() * 300));
          await this.delay(2000);

          // Extract product data
          const productData = await productPage.evaluate((url) => {
            // Extract name from h1.review_title, remove "Review"
            const titleElement = document.querySelector('.review_title');
            let name = '';
            if (titleElement?.textContent) {
              name = titleElement.textContent.trim().replace(/\s*Review\s*$/, '');
            }

            // Extract brand from manufacturer_fact_table
            let brandName = '';
            const manufacturerTable = document.querySelector('#manufacturer_fact_table');
            if (manufacturerTable) {
              const rows = manufacturerTable.querySelectorAll('tr');
              for (const row of rows) {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 2 && cells[0].textContent?.includes('Name:')) {
                  const brandEl = cells[1].querySelector('b') || cells[1];
                  brandName = brandEl.textContent?.trim() || '';
                  break;
                }
              }
            }

            // Extract category from "Type of food"
            let typeOfFood = '';
            const factTable = document.querySelector('#fact_table');
            if (factTable) {
              const rows = factTable.querySelectorAll('tr');
              for (const row of rows) {
                const cells = row.querySelectorAll('td');
                if (cells.length >= 2 && cells[0].textContent?.includes('Type of food')) {
                  typeOfFood = cells[1].textContent?.trim() || '';
                  break;
                }
              }
            }

            // Extract image URL
            const imageElement = document.querySelector('.reviewpic');
            const imageUrl = imageElement ? getComputedStyle(imageElement).backgroundImage.match(/url\(["']?([^"']*)["']?\)/)?.[1] : '';

            // Extract package size and price from RRP
            let packageSize = '';
            let price = '';
            const rrpElements = document.querySelectorAll('.rrp_print');
            for (const rrpEl of rrpElements) {
              const text = rrpEl.textContent?.trim() || '';
              const match = text.match(/(\d+(?:\.\d+)?kg)\s*bags?\s*=\s*£(\d+(?:\.\d{2})?)/);
              if (match) {
                packageSize = match[1];
                price = match[2];
                break;
              }
            }

            // Extract sub_category from breeds_container
            const breedsContainer = document.querySelector('.breeds_container');
            const subCategories: string[] = [];
            if (breedsContainer) {
              const breedElements = breedsContainer.querySelectorAll('.breeds');
              for (const breedEl of breedElements) {
                if (!breedEl.classList.contains('breeds_off')) {
                  const tooltip = breedEl.parentElement?.querySelector('.tooltip span');
                  if (tooltip?.textContent) {
                    const match = tooltip.textContent.match(/Suitable for (\w+) breed/);
                    if (match) {
                      subCategories.push(match[1]);
                    }
                  }
                }
              }
            }

            // Extract profile badges (Natural, Hypoallergenic, Certified)
            const profileBadges: string[] = [];

            // Check for Natural badge
            const naturalBadge = document.querySelector('.profile_pic.profile_natural_1');
            if (naturalBadge) {
              profileBadges.push('Natural');
            }

            // Check for Hypoallergenic badge
            const hypoBadge = document.querySelector('.profile_pic.profile_hypo_1');
            if (hypoBadge) {
              profileBadges.push('Hypoallergenic');
            }

            // Check for Certified Complete badge
            const certifiedBadge = document.querySelector('.profile_pic.profile_balanced_1');
            if (certifiedBadge) {
              profileBadges.push('Certified');
            }

            // Combine life stages and profile badges
            const allSubCategories = [...subCategories, ...profileBadges];

            // Extract nutritional data from .analysis
            const analysisElement = document.querySelector('.analysis');
            let protein = '', fat = '', fiber = '', ash = '', moisture = '', calcium = '', phosphorus = '', omega3 = '', omega6 = '';
            if (analysisElement?.textContent) {
              const text = analysisElement.textContent.trim();
              const proteinMatch = text.match(/Protein (\d+(?:\.\d+)?)%/);
              if (proteinMatch) protein = proteinMatch[1];
              const fatMatch = text.match(/Fat (\d+(?:\.\d+)?)%/);
              if (fatMatch) fat = fatMatch[1];
              const fiberMatch = text.match(/Fibre (\d+(?:\.\d+)?)%/);
              if (fiberMatch) fiber = fiberMatch[1];
              const ashMatch = text.match(/Ash (\d+(?:\.\d+)?)%/);
              if (ashMatch) ash = ashMatch[1];
              const moistureMatch = text.match(/Moisture (\d+(?:\.\d+)?)%/);
              if (moistureMatch) moisture = moistureMatch[1];
              const calciumMatch = text.match(/Calcium (\d+(?:\.\d+)?)%/);
              if (calciumMatch) calcium = calciumMatch[1];
              const phosphorusMatch = text.match(/Phosphorus (\d+(?:\.\d+)?)%/);
              if (phosphorusMatch) phosphorus = phosphorusMatch[1];
              const omega3Match = text.match(/Omega3 (\d+(?:\.\d+)?)%/);
              if (omega3Match) omega3 = omega3Match[1];
              const omega6Match = text.match(/Omega6 (\d+(?:\.\d+)?)%/);
              if (omega6Match) omega6 = omega6Match[1];
            }

            // Extract calories
            const energyElement = document.querySelector('.energy');
            let calories = '';
            if (energyElement?.textContent) {
              calories = energyElement.textContent.trim();
            }

            // Extract ingredients
            const ingredientsElement = document.querySelector('.variety.ingredients');
            let ingredients = '';
            if (ingredientsElement?.textContent) {
              ingredients = ingredientsElement.textContent.trim();
            }

            return {
              name,
              brand_name: brandName,
              type_of_food: typeOfFood,
              image_url: imageUrl,
              package_size: packageSize,
              price_gbp: price,
              sub_category: allSubCategories.join(', '),
              protein_percent: protein,
              fat_percent: fat,
              fiber_percent: fiber,
              ash_percent: ash,
              moisture_percent: moisture,
              calcium_percent: calcium,
              phosphorus_percent: phosphorus,
              omega3_percent: omega3,
              omega6_percent: omega6,
              calories_per_100g: calories,
              ingredients_raw: ingredients,
              scrape_source_url: url
            };
          }, productUrl);

          if (productData.name) {
            // Generate slug
            const slug = this.generateSlug(productData.name);

            // Download image if available
            if (productData.image_url) {
              const imageFilename = `${slug}.jpg`;
              console.log(`📸 Downloading image for ${productData.name}...`);
              const localImagePath = await this.downloadImage(productData.image_url, imageFilename);
              if (localImagePath) {
                productData.image_url = localImagePath;
                console.log(`✅ Image saved: ${localImagePath}`);
              } else {
                console.warn(`⚠️  Failed to download image, keeping remote URL`);
              }
            }

            // Find brand_id
            let brandId = null;
            if (productData.brand_name) {
              const { data: brand } = await this.supabase
                .from('brands')
                .select('id')
                .eq('name', productData.brand_name)
                .single();
              if (brand) {
                brandId = brand.id;
              }
            }

            const product: ProductData = {
              name: productData.name,
              slug,
              brand_id: brandId || undefined,
              brand_name: productData.brand_name,
              category: this.mapCategory(productData.type_of_food),
              sub_category: productData.sub_category || undefined,
              image_url: productData.image_url,
              package_size_g: productData.package_size ? parseFloat(productData.package_size.replace('kg', '')) * 1000 : undefined,
              price_gbp: productData.price_gbp ? parseFloat(productData.price_gbp) : undefined,
              protein_percent: productData.protein_percent ? parseFloat(productData.protein_percent) : undefined,
              fat_percent: productData.fat_percent ? parseFloat(productData.fat_percent) : undefined,
              fiber_percent: productData.fiber_percent ? parseFloat(productData.fiber_percent) : undefined,
              ash_percent: productData.ash_percent ? parseFloat(productData.ash_percent) : undefined,
              moisture_percent: productData.moisture_percent ? parseFloat(productData.moisture_percent) : undefined,
              calcium_percent: productData.calcium_percent ? parseFloat(productData.calcium_percent) : undefined,
              phosphorus_percent: productData.phosphorus_percent ? parseFloat(productData.phosphorus_percent) : undefined,
              omega3_percent: productData.omega3_percent ? parseFloat(productData.omega3_percent) : undefined,
              omega6_percent: productData.omega6_percent ? parseFloat(productData.omega6_percent) : undefined,
              calories_per_100g: productData.calories_per_100g ? Math.round(parseFloat(productData.calories_per_100g)) : undefined,
              ingredients_raw: productData.ingredients_raw,
              scrape_source_url: productData.scrape_source_url
            };

            console.log(`✅ Scraped: ${productData.name}`);
            console.log(`  Brand: ${productData.brand_name}`);
            console.log(`  Category: ${this.mapCategory(productData.type_of_food)}`);
            console.log(`  Sub-category: ${productData.sub_category}`);
            console.log(`  Image: ${productData.image_url ? 'Yes' : 'No'}`);
            console.log(`  Package: ${productData.package_size} - £${productData.price_gbp}`);
            console.log(`  Protein: ${productData.protein_percent}%`);
            console.log(`  Ingredients: ${productData.ingredients_raw?.substring(0, 50)}...`);

            products.push(product);
          } else {
            console.log(`⚠️  Skipping product - missing required data`);
          }

          await productPage.close();

          // Rate limiting
          await this.delay(1000);

        } catch (error) {
          console.log(`❌ Error scraping product ${productUrl}:`, error);
        }
      }

    } catch (error) {
      console.error('❌ Error scraping products:', error);
      throw error;
    } finally {
      await page.close();
    }

    return products;
  }

  async saveProducts(products: ProductData[]): Promise<{ created: number; updated: number; errors: string[] }> {
    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const product of products) {
      try {
        // Find brand by name with improved matching
        let brandId = null;
        if (product.brand_name) {
          // Try exact match first
          let { data: brand } = await this.supabase
            .from('brands')
            .select('id')
            .eq('name', product.brand_name)
            .single();

          // If no exact match, try fuzzy matching (extract first word, check slug)
          if (!brand) {
            const firstWord = product.brand_name.split(/[\s-]+/)[0];
            const { data: brands } = await this.supabase
              .from('brands')
              .select('id, name, slug')
              .or(`name.ilike.%${firstWord}%,slug.ilike.%${firstWord}%`);

            if (brands && brands.length > 0) {
              brand = brands[0];
              console.log(`📎 Fuzzy matched "${product.brand_name}" to "${brands[0].name}"`);
            }
          }

          if (brand) {
            brandId = brand.id;
          } else {
            console.warn(`⚠️  Brand not found for product ${product.name}: ${product.brand_name}`);
          }
        }

        const slug = this.generateSlug(product.name);

        // Calculate price per kg
        let pricePerKg = null;
        if (product.price_gbp && product.package_size_g) {
          pricePerKg = product.price_gbp / (product.package_size_g / 1000);
        }

        // Prepare product data for scoring
        const productForScoring = {
          ...product,
          price_per_kg_gbp: pricePerKg,
        };

        // Calculate scores
        const scores = calculateOverallScore(productForScoring as any);

        // Parse ingredients into a list
        const ingredientsList = product.ingredients_raw
          ? this.parseIngredients(product.ingredients_raw)
          : null;

        // Parse sub_category as JSON array if it's a string
        let subCategoryValue = product.sub_category;
        if (typeof subCategoryValue === 'string' && subCategoryValue) {
          // If it's comma-separated, convert to JSON array
          if (subCategoryValue.includes(',')) {
            const categories = subCategoryValue.split(',').map(s => s.trim());
            subCategoryValue = JSON.stringify(categories);
          }
        }

        const { error } = await this.supabase
          .from('products')
          .upsert({
            slug,
            name: product.name,
            brand_id: brandId,
            category: product.category,
            sub_category: subCategoryValue,
            image_url: product.image_url,
            price_gbp: product.price_gbp,
            package_size_g: product.package_size_g,
            price_per_kg_gbp: pricePerKg,
            ingredients_raw: product.ingredients_raw,
            ingredients_list: ingredientsList,
            protein_percent: product.protein_percent,
            fat_percent: product.fat_percent,
            fiber_percent: product.fiber_percent,
            ash_percent: product.ash_percent,
            moisture_percent: product.moisture_percent,
            calories_per_100g: product.calories_per_100g,
            overall_score: scores.overallScore,
            ingredient_score: scores.ingredientScore,
            nutrition_score: scores.nutritionScore,
            value_score: scores.valueScore,
            scoring_breakdown: scores.breakdown,
            scrape_source_url: product.scrape_source_url,
            is_available: true,
            last_scraped_at: new Date().toISOString(),
          }, {
            onConflict: 'slug'
          });

        if (error) throw error;

        // Check if it was created or updated
        const { data: existing } = await this.supabase
          .from('products')
          .select('created_at, updated_at')
          .eq('slug', slug)
          .single();

        if (existing) {
          const createdTime = new Date(existing.created_at).getTime();
          const updatedTime = new Date(existing.updated_at).getTime();

          if (Math.abs(updatedTime - createdTime) < 1000) { // Within 1 second
            created++;
          } else {
            updated++;
          }
        }

        console.log(`✅ Saved product: ${product.name}`);

      } catch (error) {
        const errorMsg = `Failed to save product ${product.name}: ${error instanceof Error ? error.message : JSON.stringify(error)}`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }

    return { created, updated, errors };
  }

  async run(): Promise<void> {
    try {
      // Get limit from command line args
      const limit = process.argv[2] ? parseInt(process.argv[2]) : undefined;

      console.log('🚀 Starting product scraping...');
      await this.initialize();

      const products = await this.scrapeProducts(limit);
      console.log(`📊 Found ${products.length} products total`);

      if (products.length === 0) {
        console.log('❌ No products found. Check your selectors!');
        return;
      }

      console.log('💾 Saving products to database...');
      const result = await this.saveProducts(products);

      console.log('✅ Product scraping completed!');
      console.log(`📊 Results: ${result.created} created, ${result.updated} updated`);

      if (result.errors.length > 0) {
        console.log('❌ Errors:');
        result.errors.forEach(error => console.log(`  - ${error}`));
      }

    } catch (error) {
      console.error('❌ Product scraping failed:', error);
    } finally {
      await this.close();
    }
  }
}

// Run if called directly
if (require.main === module) {
  const scraper = new ProductScraper();
  scraper.run().catch(console.error);
}

export { ProductScraper };