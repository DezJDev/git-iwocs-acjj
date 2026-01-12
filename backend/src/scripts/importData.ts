import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { sequelize, testConnection } from '../config/database';
import Champion, { ChampionCreationAttributes } from '../models/Champion';

/**
 * Data Import Script
 * This script imports champion data from CSV file into the database
 */

const CSV_FILE_PATH = path.join(__dirname, 'data.csv');

interface CSVRow {
  championName: string;
  role: string;
  genre: string;
  espece: string;
  ressource: string;
  range: string;
  regions: string;
  releaseDate: string;
  iconUrl: string;
}

async function importData(): Promise<void> {
  console.log('🚀 Starting data import from CSV...\n');

  // Step 1: Test connection
  console.log('Step 1: Testing database connection...');
  const isConnected = await testConnection();

  if (!isConnected) {
    console.error('\n❌ Import failed: Could not connect to database');
    process.exit(1);
  }

  // Step 2: Check if CSV file exists
  console.log('\nStep 2: Checking CSV file...');
  if (!fs.existsSync(CSV_FILE_PATH)) {
    console.error(`\n❌ CSV file not found at: ${CSV_FILE_PATH}`);
    process.exit(1);
  }
  console.log(`✓ CSV file found: ${CSV_FILE_PATH}`);

  try {
    // Step 3: Ensure table exists
    console.log('\nStep 3: Ensuring champion table exists...');
    await sequelize.sync({ alter: false });
    console.log('✓ Champion table ready');

    // Step 4: Read and parse CSV
    console.log('\nStep 4: Reading CSV file...');
    const champions: ChampionCreationAttributes[] = [];

    await new Promise<void>((resolve, reject) => {
      fs.createReadStream(CSV_FILE_PATH)
        .pipe(csv())
        .on('data', (row: CSVRow) => {
          // Map CSV columns to model fields
          champions.push({
            championName: row.championName,
            role: row.role,
            genre: row.genre,
            espece: row.espece,
            ressource: row.ressource,
            range: row.range,
            regions: row.regions,
            releaseDate: row.releaseDate,
            iconUrl: row.iconUrl
          });
        })
        .on('end', resolve)
        .on('error', reject);
    });

    console.log(`✓ Parsed ${champions.length} champions from CSV`);

    // Step 5: Import data
    console.log('\nStep 5: Importing champions to database...');

    let imported = 0;
    let updated = 0;
    let errors = 0;

    for (const championData of champions) {
      try {
        const [champion, created] = await Champion.upsert(championData, {
          returning: true
        });

        if (created) {
          imported++;
        } else {
          updated++;
        }

        if ((imported + updated) % 20 === 0) {
          process.stdout.write(`  Progress: ${imported + updated}/${champions.length}\r`);
        }

      } catch (error: any) {
        errors++;
        console.error(`\n  ⚠️  Error importing ${championData.championName}:`, error.message);
      }
    }

    console.log(`\n\n✅ Import complete!`);
    console.log(`   • New champions imported: ${imported}`);
    console.log(`   • Existing champions updated: ${updated}`);
    if (errors > 0) {
      console.log(`   • Errors: ${errors}`);
    }

    // Step 6: Verify import
    console.log('\nStep 6: Verifying data...');
    const totalCount = await Champion.count();
    console.log(`✓ Total champions in database: ${totalCount}\n`);

  } catch (error: any) {
    console.error('\n❌ Error during import:', error.message);
    console.error(error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run the import
importData();
