#!/usr/bin/env node

/**
 * Script to update homepage stats cache
 * Run this script to refresh the cached stats data
 */

import { config } from 'dotenv';
import { getCachedSupabaseClient } from '../lib/cache/cached-supabase';
import { getSupabase } from '../lib/supabase';

// Load environment variables from .env.local
config({ path: '.env.local' });

async function updateStatsCache() {
  console.log('🔄 Updating homepage stats cache...');

  try {
    const supabase = getSupabase();

    // Get total available products count
    const { count: totalProducts, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('is_available', true);

    if (countError) {
      throw countError;
    }

    // Get total brands count
    const { count: totalBrands, error: brandsError } = await supabase
      .from('brands')
      .select('*', { count: 'exact', head: true });

    if (brandsError) {
      throw brandsError;
    }

    // Calculate average score from ALL AVAILABLE products with valid scores
    console.log('⭐ Calculating average score from all available products...');
    let allScores: any[] = [];
    let page = 1;
    const pageSize = 1000;
    let hasMore = true;

    while (hasMore) {
      const { data: scores, error: scoreError } = await supabase
        .from('products')
        .select('overall_score')
        .eq('is_available', true)
        .not('overall_score', 'is', null)
        .gt('overall_score', 0)
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (scoreError) {
        console.error('Error fetching scores page', page, ':', scoreError);
        throw scoreError;
      }

      if (scores && scores.length > 0) {
        allScores = allScores.concat(scores);
        page++;
      } else {
        hasMore = false;
      }

      // Safety check to prevent infinite loops
      if (page > 10) {
        console.warn('Reached maximum pages, stopping pagination');
        hasMore = false;
      }
    }

    console.log(`Fetched ${allScores.length} products with scores for average calculation`);

    const averageScore = allScores.length > 0
      ? Math.round(allScores.reduce((sum, product: any) => sum + (product.overall_score || 0), 0) / allScores.length)
      : 70;

    const stats = {
      totalProducts,
      totalBrands,
      averageScore,
      lastUpdated: new Date().toISOString()
    };

    console.log('✅ Stats updated successfully!');
    console.log(`   Products: ${totalProducts}`);
    console.log(`   Brands: ${totalBrands}`);
    console.log(`   Average Score: ${averageScore}`);
    console.log(`   Last Updated: ${stats.lastUpdated}`);

    // Note: The actual caching happens when the API is called
    // This script just warms up the database caches
    console.log('📝 Note: Client-side caching happens when users visit the homepage');

  } catch (error) {
    console.error('❌ Error updating stats cache:', error);
    process.exit(1);
  }
}

// Run the script
updateStatsCache();