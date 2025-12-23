#!/usr/bin/env node

/**
 * Test script to verify profile badge extraction from AllAboutDogFood.co.uk
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

puppeteer.use(StealthPlugin());

async function testProfileBadges() {
  console.log('🧪 Testing profile badge extraction...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // Test with the Collards product
    const testUrl = 'https://www.allaboutdogfood.co.uk/dog-food-reviews/0357/collards-puppy-dry-turkey-rice';
    console.log(`Testing with: ${testUrl}\n`);

    await page.goto(testUrl, {
      waitUntil: 'domcontentloaded',
      timeout: 60000
    });

    // Wait a bit for the page to fully load
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Save the HTML to a file for inspection
    const html = await page.content();
    const fs = await import('fs');
    fs.writeFileSync('test-page.html', html);
    console.log('Saved HTML to test-page.html for inspection\n');

    const badges = await page.evaluate(() => {
      const results: any = {
        natural: false,
        hypoallergenic: false,
        certified: false,
        found: [],
        html: ''
      };

      // Get the profile container HTML for debugging
      const profileContainer = document.querySelector('.profile.profile_xl');
      if (profileContainer) {
        results.html = profileContainer.innerHTML.substring(0, 500);
      }

      // Check for Natural badge
      const naturalBadge = document.querySelector('.profile_pic.profile_natural_1');
      if (naturalBadge) {
        results.natural = true;
        results.found.push('Natural');
      }

      // Check for Hypoallergenic badge
      const hypoBadge = document.querySelector('.profile_pic.profile_hypo_1');
      if (hypoBadge) {
        results.hypoallergenic = true;
        results.found.push('Hypoallergenic');
      }

      // Check for Certified Complete badge
      const certifiedBadge = document.querySelector('.profile_pic.profile_balanced_1');
      if (certifiedBadge) {
        results.certified = true;
        results.found.push('Certified');
      }

      // Also check what profile badges exist
      const allProfileBadges = Array.from(document.querySelectorAll('.profile_pic'))
        .map(el => el.className);
      results.allBadges = allProfileBadges;

      // Check for alternative selectors
      results.alternativeCheck = {
        hasProfile: !!document.querySelector('.profile'),
        hasProfileXL: !!document.querySelector('.profile_xl'),
        hasAnyProfilePic: !!document.querySelector('[class*="profile_pic"]')
      };

      return results;
    });

    console.log('Results:');
    console.log('--------');
    console.log('✅ Natural:', badges.natural ? 'YES' : 'NO');
    console.log('✅ Hypoallergenic:', badges.hypoallergenic ? 'YES' : 'NO');
    console.log('✅ Certified:', badges.certified ? 'YES' : 'NO');
    console.log('\nBadges found:', badges.found.length > 0 ? badges.found.join(', ') : 'None');
    console.log('\nAlternative checks:');
    console.log('  - Has .profile:', badges.alternativeCheck.hasProfile);
    console.log('  - Has .profile_xl:', badges.alternativeCheck.hasProfileXL);
    console.log('  - Has [class*="profile_pic"]:', badges.alternativeCheck.hasAnyProfilePic);
    console.log('\nAll profile badge classes found on page:');
    if (badges.allBadges.length > 0) {
      badges.allBadges.forEach((badge: string) => {
        console.log(`  - ${badge}`);
      });
    } else {
      console.log('  (none found)');
    }

    if (badges.html) {
      console.log('\nProfile container HTML sample:');
      console.log(badges.html);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

testProfileBadges().catch(console.error);
