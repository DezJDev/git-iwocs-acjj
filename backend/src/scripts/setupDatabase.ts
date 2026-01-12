import { sequelize, testConnection } from '../config/database';
import Champion from '../models/Champion';

/**
 * Database Setup Script
 * This script will:
 * 1. Test database connection
 * 2. Create the champion table if it doesn't exist
 * 3. Sync the model with the database
 */

async function setupDatabase(): Promise<void> {
  console.log('🚀 Starting database setup...\n');

  // Step 1: Test connection
  console.log('Step 1: Testing database connection...');
  const isConnected = await testConnection();

  if (!isConnected) {
    console.error('\n❌ Database setup failed: Could not connect to database');
    process.exit(1);
  }

  try {
    // Step 2: Sync models (create tables if they don't exist)
    console.log('\nStep 2: Syncing database models...');

    // Use { alter: true } to update existing tables without dropping them
    // Use { force: true } to drop and recreate tables (WARNING: deletes all data!)
    await sequelize.sync({ alter: false });

    console.log('✓ Database models synced successfully');

    // Step 3: Check if table exists and has data
    console.log('\nStep 3: Checking champion table...');
    const count = await Champion.count();
    console.log(`✓ Champion table exists with ${count} records`);

    if (count === 0) {
      console.log('\n⚠️  WARNING: Champion table is empty!');
      console.log('   Run "npm run db:import" to import champion data from CSV');
    }

    console.log('\n✅ Database setup complete!\n');

  } catch (error: any) {
    console.error('\n❌ Error during database setup:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the setup
setupDatabase();
