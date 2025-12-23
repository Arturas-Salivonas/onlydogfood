#!/usr/bin/env node

/**
 * Brand Scraper Script for AllAboutDogFood.co.uk
 * Scrapes brand data from allaboutdogfood.co.uk
 *
 * Usage: npm run scrape:brands [limit]
 * Example: npm run scrape:brands 20 (scrapes first 20 brands)
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import type { Browser } from 'puppeteer';
import { getServiceSupabase } from '../lib/supabase';
import * as readline from 'readline';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';

// Add stealth plugin
puppeteer.use(StealthPlugin());

interface BrandData {
  name: string;
  slug: string;
  logo_url?: string;
  website_url?: string;
  description?: string;
  country_of_origin?: string;
}

class BrandScraper {
  private browser: Browser | null = null;
  private supabase = getServiceSupabase();
  private logoDir = path.join(process.cwd(), 'public', 'brand', 'logo');

  async initialize(): Promise<void> {
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

  private async downloadImage(url: string, filename: string): Promise<string | null> {
    try {
      if (!this.browser) throw new Error('Browser not initialized');

      const filePath = path.join(this.logoDir, filename);

      // Use Puppeteer to download image to bypass anti-bot protection (403 errors)
      const imagePage = await this.browser.newPage();

      try {
        const response = await imagePage.goto(url, { waitUntil: 'networkidle2', timeout: 10000 });

        if (!response || response.status() !== 200) {
          console.log(`⚠️  Failed to load logo: HTTP ${response?.status()}`);
          await imagePage.close();
          return null;
        }

        const buffer = await response.buffer();
        fs.writeFileSync(filePath, buffer);

        await imagePage.close();
        return `/brand/logo/${filename}`;

      } catch (error) {
        console.log(`⚠️  Logo download error: ${error}`);
        await imagePage.close();
        return null;
      }

    } catch (error) {
      console.log(`⚠️  Failed to download logo: ${error}`);
      return null;
    }
  }

  async scrapeBrands(limit?: number): Promise<BrandData[]> {
    if (!this.browser) throw new Error('Browser not initialized');

    const brands: BrandData[] = [];
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
      const brandsUrl = `${baseUrl}/brands?type%5B%5D=raw&type%5B%5D=wet&type%5B%5D=dry&sort=rating&limit=500&page=1`;

      console.log(`🌐 Navigating to ${brandsUrl}...`);
      await page.goto(brandsUrl, { waitUntil: 'networkidle2', timeout: 30000 });

      // Simulate human behavior
      await page.mouse.move(Math.random() * 800, Math.random() * 600);
      await page.evaluate(() => window.scrollTo(0, Math.random() * 300));
      await this.delay(2000);

      // Wait a bit more for dynamic content
      await this.delay(3000);

      // Try different selectors for brand items
      const selectors = ['.item', '.brand-item', '.manufacturer-item', '.brand-card', '.company-item'];
      let brandElements = null;

      for (const selector of selectors) {
        try {
          await page.waitForSelector(selector, { timeout: 5000 });
          brandElements = await page.$$(selector);
          if (brandElements.length > 0) {
            console.log(`✅ Found ${brandElements.length} brand elements with selector: ${selector}`);
            break;
          }
        } catch (e) {
          continue;
        }
      }

      if (!brandElements || brandElements.length === 0) {
        console.log('❌ No brand elements found. Available selectors:');
        // Log some debugging info
        const bodyText = await page.evaluate(() => document.body.innerText.substring(0, 500));
        console.log('Page content preview:', bodyText);
        return [];
      }

      console.log('📄 Extracting brand links...');

      // Get all "Find out more" links
      const brandLinks = await page.evaluate(() => {
        const items = document.querySelectorAll('.item, .brand-item, .manufacturer-item, .brand-card, .company-item');
        const links: string[] = [];

        for (const item of items) {
          const link = item.querySelector('.button[href*="/dog-food-brands/"], a[href*="/dog-food-brands/"]') as HTMLAnchorElement;
          if (link?.href) {
            links.push(link.href);
          }
        }

        return links;
      });

      console.log(`🔍 Found ${brandLinks.length} brand links`);

      // Limit the number of brands to scrape if specified
      const linksToScrape = limit ? brandLinks.slice(0, limit) : brandLinks;

      for (let i = 0; i < linksToScrape.length; i++) {
        const brandUrl = linksToScrape[i];
        console.log(`🔍 Scraping brand ${i + 1}/${linksToScrape.length}: ${brandUrl}`);

        try {
          const brandPage = await this.browser.newPage();
          await brandPage.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
          await brandPage.setExtraHTTPHeaders({
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
            'Accept-Encoding': 'gzip, deflate',
            'Connection': 'keep-alive',
            'Upgrade-Insecure-Requests': '1',
            'Cache-Control': 'max-age=0',
          });
          await brandPage.setViewport({ width: 1920, height: 1080 });

          await brandPage.goto(brandUrl, { waitUntil: 'networkidle2', timeout: 30000 });

          // Simulate human behavior
          await brandPage.mouse.move(Math.random() * 800, Math.random() * 600);
          await brandPage.evaluate(() => window.scrollTo(0, Math.random() * 300));
          await this.delay(2000);

          // Try to expand company info if available
          try {
            await brandPage.waitForSelector('#see_more_company_info', { timeout: 2000 });
            await brandPage.click('#see_more_company_info');
            await this.delay(1000);
          } catch (e) {
            // Element doesn't exist, continue
          }

          // Extract brand data
          const brandData = await brandPage.evaluate((url) => {
            // Extract brand name from h1
            const nameElement = document.querySelector('.new-brand-h2');
            let name = '';
            if (nameElement?.textContent) {
              name = nameElement.textContent.trim().replace(/\s*dog food\s*$/i, '');
            }

            // Extract slug from URL
            const urlMatch = url.match(/\/dog-food-brands\/[^\/]+\/(.+)$/);
            const slug = urlMatch ? urlMatch[1] : '';

            // Extract logo URL
            const logoElement = document.querySelector('.dog-food-img img');
            const logoUrl = logoElement?.getAttribute('src') || '';

            // Extract description
            const descElement = document.querySelector('#about_company_text');
            let description = '';
            if (descElement?.textContent) {
              description = descElement.textContent.trim();
            }

            // Extract country from location data
            let country = '';
            const dataElements = document.querySelectorAll('.data');
            for (const dataEl of dataElements) {
              const labelEl = dataEl.querySelector('.label');
              if (labelEl?.textContent?.includes('Location')) {
                const valueEl = dataEl.querySelector('.value');
                if (valueEl?.textContent) {
                  const text = valueEl.textContent.trim().replace(/\s+/g, ' ');
                  // Extract country from text like "Norfolk, UK" -> "UK"
                  const countryMatch = text.match(/,\s*([A-Za-z\s]+)$/);
                  if (countryMatch) {
                    country = countryMatch[1].trim();
                  } else if (text.includes('UK') || text.includes('United Kingdom')) {
                    country = 'UK';
                  } else {
                    country = text;
                  }
                  break;
                }
              }
            }

            return {
              name,
              slug,
              logo_url: logoUrl,
              description,
              country_of_origin: country
            };
          }, brandUrl);

          if (brandData.name && brandData.slug) {
            // Download logo if available
            if (brandData.logo_url) {
              const logoFilename = `${brandData.slug}.png`;
              console.log(`📸 Downloading logo for ${brandData.name}...`);
              const localLogoPath = await this.downloadImage(brandData.logo_url, logoFilename);
              if (localLogoPath) {
                brandData.logo_url = localLogoPath;
                console.log(`✅ Logo saved: ${localLogoPath}`);
              } else {
                console.warn(`⚠️  Failed to download logo, keeping remote URL`);
              }
            }

            brands.push(brandData);
            console.log(`✅ Scraped: ${brandData.name} (${brandData.slug})`);
          } else {
            console.log(`⚠️  Skipping brand - missing required data`);
          }

          await brandPage.close();
          await this.delay(3000); // Be respectful to the server - increased delay

        } catch (error) {
          console.error(`❌ Failed to scrape ${brandUrl}:`, error);
        }
      }

    } catch (error) {
      console.error('❌ Error during brand scraping:', error);
    } finally {
      await page.close();
    }

    return brands;
  }

  async saveBrands(brands: BrandData[]): Promise<{ created: number; updated: number; errors: string[] }> {
    let created = 0;
    let updated = 0;
    const errors: string[] = [];

    for (const brand of brands) {
      try {
        const { error } = await this.supabase
          .from('brands')
          .upsert({
            slug: brand.slug,
            name: brand.name,
            logo_url: brand.logo_url,
            website_url: brand.website_url,
            description: brand.description,
            country_of_origin: brand.country_of_origin,
          }, {
            onConflict: 'slug'
          });

        if (error) throw error;

        // Check if it was created or updated
        const { data: existing } = await this.supabase
          .from('brands')
          .select('created_at, updated_at')
          .eq('slug', brand.slug)
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

        console.log(`✅ Saved brand: ${brand.name}`);

      } catch (error) {
        const errorMsg = `Failed to save brand ${brand.name}: ${error}`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }
    }

    return { created, updated, errors };
  }

  async run(): Promise<void> {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const limit = args.length > 0 ? parseInt(args[0]) : undefined;

    if (limit && isNaN(limit)) {
      console.log('❌ Invalid limit. Usage: npm run scrape:brands [limit]');
      return;
    }

    try {
      console.log('🚀 Starting brand scraping from AllAboutDogFood.co.uk...');
      if (limit) {
        console.log(`📊 Limiting to ${limit} brands for testing`);
      }

      await this.initialize();

      const brands = await this.scrapeBrands(limit);
      console.log(`📊 Found ${brands.length} brands total`);

      if (brands.length === 0) {
        console.log('❌ No brands found. Check the website structure!');
        return;
      }

      console.log('💾 Saving brands to database...');
      const result = await this.saveBrands(brands);

      console.log('✅ Brand scraping completed!');
      console.log(`📊 Results: ${result.created} created, ${result.updated} updated`);

      if (result.errors.length > 0) {
        console.log('❌ Errors:');
        result.errors.forEach(error => console.log(`  - ${error}`));
      }

    } catch (error) {
      console.error('❌ Brand scraping failed:', error);
    } finally {
      await this.close();
    }
  }
}

// Run if called directly
if (require.main === module) {
  const scraper = new BrandScraper();
  scraper.run().catch(console.error);
}

export { BrandScraper };