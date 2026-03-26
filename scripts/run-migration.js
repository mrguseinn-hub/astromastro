// Migration script to create database schema
// Run with: node scripts/run-migration.js

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL || 'https://akryacotozlzjwnjluuy.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runMigration() {
  console.log('Running migration...');

  // Read the SQL file
  const sqlPath = path.join(__dirname, '../supabase/migrations/001_initial_schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  // Split by semicolons and execute each statement
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  console.log(`Found ${statements.length} statements to execute`);

  for (let i = 0; i < statements.length; i++) {
    const statement = statements[i] + ';';

    // Skip comments
    if (statement.trim().startsWith('--')) continue;

    try {
      // For DDL statements, we need to use RPC
      // Since we can't execute raw SQL via REST API, we'll create tables one by one
      console.log(`Executing statement ${i + 1}/${statements.length}...`);

      // Note: Supabase REST API doesn't support raw SQL execution for DDL
      // This script is for reference - actual migration should be done via:
      // 1. Supabase Dashboard SQL Editor
      // 2. Supabase CLI (supabase db push)
      // 3. Direct PostgreSQL connection

    } catch (error) {
      console.error(`Error in statement ${i + 1}:`, error.message);
    }
  }

  console.log('\nMigration script completed.');
  console.log('\nNote: To apply this migration, please:');
  console.log('1. Go to Supabase Dashboard > SQL Editor');
  console.log('2. Copy the contents of supabase/migrations/001_initial_schema.sql');
  console.log('3. Execute the SQL in the editor');
}

runMigration().catch(console.error);