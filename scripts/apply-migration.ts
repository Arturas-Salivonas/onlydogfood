#!/usr/bin/env node

import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { getServiceSupabase } from '../lib/supabase';
import * as fs from 'fs';
import * as path from 'path';

async function applyMigration() {
  const supabase = getServiceSupabase();

  console.log('🔄 Applying migration to remove quality flag columns...');

  const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '002_remove_quality_flags.sql');
  const sql = fs.readFileSync(migrationPath, 'utf-8');

  const statements = sql.split(';').filter(s => s.trim());

  for (const statement of statements) {
    if (statement.trim()) {
      console.log(`Executing: ${statement.trim().substring(0, 50)}...`);
      const { error } = await supabase.rpc('exec_sql', { sql: statement.trim() + ';' });

      if (error) {
        console.error('❌ Error:', error);
      } else {
        console.log('✅ Success');
      }
    }
  }

  console.log('\n✅ Migration completed!');
}

applyMigration().catch(console.error);
