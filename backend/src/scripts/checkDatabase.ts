import { sequelize } from '../config/database';
import Champion from '../models/Champion';

/**
 * Check Database Script
 * This script checks what exists in your RDS database
 */

async function checkDatabase(): Promise<void> {
  console.log('🔍 Checking AWS RDS Database...\n');

  try {
    // Step 1: Test connection
    console.log('Step 1: Testing database connection...');
    await sequelize.authenticate();
    console.log('✓ Successfully connected to database\n');

    // Step 2: Check if champion table exists
    console.log('Step 2: Checking if champion table exists...');
    const [results] = await sequelize.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'champion'
      );
    `);

    const tableExists = (results as any)[0].exists;

    if (tableExists) {
      console.log('✓ Champion table exists\n');

      // Step 3: Check table structure
      console.log('Step 3: Checking table structure...');
      const [columns] = await sequelize.query(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'champion'
        ORDER BY ordinal_position;
      `);

      console.log('Table columns:');
      console.table(columns);

      // Step 4: Check primary key
      console.log('\nStep 4: Checking primary key...');
      const [pkInfo] = await sequelize.query(`
        SELECT a.attname
        FROM   pg_index i
        JOIN   pg_attribute a ON a.attrelid = i.indrelid
                             AND a.attnum = ANY(i.indkey)
        WHERE  i.indrelid = 'champion'::regclass
        AND    i.indisprimary;
      `);

      if ((pkInfo as any[]).length > 0) {
        console.log('✓ Primary key found:', (pkInfo as any[])[0].attname);
      } else {
        console.log('⚠️  No primary key found');
      }

      // Step 5: Count records
      console.log('\nStep 5: Counting champion records...');
      const count = await Champion.count();
      console.log(`✓ Total champions in database: ${count}`);

      if (count > 0) {
        // Step 6: Show sample data
        console.log('\nStep 6: Sample champions (first 5):');
        const sampleChampions = await Champion.findAll({
          limit: 5,
          attributes: ['championName', 'role', 'releaseDate']
        });

        sampleChampions.forEach(champ => {
          console.log(`  - ${champ.championName} (${champ.role})`);
        });
      } else {
        console.log('\n⚠️  Database is empty. You need to run: npm run db:import');
      }

    } else {
      console.log('❌ Champion table does NOT exist');
      console.log('   You need to run: npm run db:setup');
    }

    console.log('\n✅ Database check complete!');

  } catch (error: any) {
    console.error('\n❌ Error checking database:', error.message);
    if (error.message.includes('ETIMEDOUT')) {
      console.log('\n💡 Connection timeout - possible causes:');
      console.log('   1. RDS Security Group does not allow your IP address');
      console.log('   2. Check AWS RDS Console → Your DB → Connectivity & Security');
      console.log('   3. Add your IP to inbound rules on port 5432');
    }
  } finally {
    await sequelize.close();
  }
}

// Run the check
checkDatabase();
