import { exec } from 'child_process';
import { promisify } from 'util';
import * as readline from 'readline';

const execPromise = promisify(exec);

/**
 * Reset Database Script
 * This script completely resets the database by:
 * 1. Dropping and recreating tables (db:setup)
 * 2. Importing all champion data (db:import)
 */

async function askConfirmation(): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(
      '\n⚠️  WARNING: This will DELETE ALL DATA in your database!\n' +
      '   Are you sure you want to continue? (yes/no): ',
      (answer) => {
        rl.close();
        resolve(answer.toLowerCase() === 'yes');
      }
    );
  });
}

async function resetDatabase(): Promise<void> {
  console.log('🔄 Database Reset Script\n');
  console.log('This will:');
  console.log('  1. Drop the champion table');
  console.log('  2. Create a new champion table');
  console.log('  3. Import all champion data from CSV\n');

  // Ask for confirmation
  const confirmed = await askConfirmation();

  if (!confirmed) {
    console.log('\n❌ Reset cancelled.');
    process.exit(0);
  }

  try {
    // Step 1: Setup database (drop + create)
    console.log('\n📋 Step 1/2: Setting up database tables...');
    const { stdout: setupOutput } = await execPromise('npm run db:setup');
    console.log(setupOutput);

    // Step 2: Import data
    console.log('\n📋 Step 2/2: Importing champion data...');
    const { stdout: importOutput } = await execPromise('npm run db:import');
    console.log(importOutput);

    console.log('\n✅ Database reset complete!');
    console.log('   Your database has been fully reset with fresh data.\n');

  } catch (error: any) {
    console.error('\n❌ Error during database reset:', error.message);
    process.exit(1);
  }
}

// Run the reset
resetDatabase();
