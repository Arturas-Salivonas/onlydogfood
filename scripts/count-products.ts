#!/usr/bin/env node

/**
 * Count Products Script
 * Counts total products in the database
 */

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { getServiceSupabase } from '../lib/supabase';

async function countProducts() {
  const supabase = getServiceSupabase();

  console.log('🔢 Counting products...\n');

  const { count, error } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('❌ Error counting products:', error);
    return;
  }

  console.log(`📊 Total products in database: ${count}\n`);
}

countProducts().catch(console.error).finally(() => process.exit(0));
