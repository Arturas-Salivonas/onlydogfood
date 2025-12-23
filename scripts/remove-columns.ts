#!/usr/bin/env node

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { getServiceSupabase } from '../lib/supabase';

async function removeColumns() {
  const supabase = getServiceSupabase();

  console.log('🔄 Removing has_artificial_additives and has_fillers columns...');

  try {
    // Fetch a product to see current schema
    const { data: before } = await supabase
      .from('products')
      .select('*')
      .limit(1)
      .single();

    console.log('Current columns:', Object.keys(before || {}));

    console.log('\n⚠️  Note: Column removal requires direct database access.');
    console.log('Please run this SQL in your Supabase SQL Editor:');
    console.log('\n--------------------------------------------------');
    console.log('ALTER TABLE products DROP COLUMN IF EXISTS has_artificial_additives;');
    console.log('ALTER TABLE products DROP COLUMN IF EXISTS has_fillers;');
    console.log('--------------------------------------------------\n');

  } catch (error) {
    console.error('Error:', error);
  }
}

removeColumns().catch(console.error);
