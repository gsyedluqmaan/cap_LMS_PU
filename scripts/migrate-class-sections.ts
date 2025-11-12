/**
 * Migration Script: Convert ClassSection from teachers array to subjects array
 * 
 * This script helps migrate existing class sections that might have the old structure
 * to the new subjects-based structure.
 * 
 * Run with: npx tsx scripts/migrate-class-sections.ts
 */

import mongoose from 'mongoose';
import '../src/models/ClassSection'; // Import model to register schema

// Connect to MongoDB
async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms';
  try {
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB');
  } catch (error) {
    console.error('✗ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function migrateClassSections() {
  await connectDB();

  const ClassSection = mongoose.model('ClassSection');
  
  try {
    // Find all class sections
    const classSections = await ClassSection.find({});
    console.log(`\nFound ${classSections.length} class sections\n`);

    let migratedCount = 0;
    let alreadyMigratedCount = 0;
    let needsAttentionCount = 0;

    for (const classSection of classSections) {
      const csData = classSection.toObject();
      
      // Check if already has subjects array
      if (csData.subjects && csData.subjects.length > 0) {
        console.log(`✓ ${csData.className} (${csData.classCode}): Already has ${csData.subjects.length} subjects configured`);
        alreadyMigratedCount++;
        continue;
      }

      // Check if has old teachers array (shouldn't exist in new schema but checking anyway)
      if (csData.teachers && Array.isArray(csData.teachers) && csData.teachers.length > 0) {
        console.log(`⚠ ${csData.className} (${csData.classCode}): Has old teachers array, needs manual migration`);
        console.log(`  Teachers: ${csData.teachers.length}`);
        console.log(`  Action needed: Add subjects using the API or admin interface`);
        needsAttentionCount++;
        continue;
      }

      // Class section needs subjects
      console.log(`⚠ ${csData.className} (${csData.classCode}): No subjects configured`);
      console.log(`  Action needed: Add subjects with teacher assignments`);
      needsAttentionCount++;
    }

    console.log('\n' + '='.repeat(60));
    console.log('Migration Summary:');
    console.log('='.repeat(60));
    console.log(`Total class sections: ${classSections.length}`);
    console.log(`Already migrated: ${alreadyMigratedCount}`);
    console.log(`Need attention: ${needsAttentionCount}`);
    console.log('='.repeat(60));

    if (needsAttentionCount > 0) {
      console.log('\n📝 Next Steps:');
      console.log('1. Go to the admin interface');
      console.log('2. Edit each class section that needs attention');
      console.log('3. Add subjects with the following information:');
      console.log('   - Subject name (e.g., "Computer Science Engineering", "Data Structures")');
      console.log('   - Teacher assignment');
      console.log('   - Hours per week');
      console.log('   - Session type (theory/lab/practical/tutorial)');
      console.log('\nOr use the API:');
      console.log('PUT /api/class-sections/[id]');
      console.log('Body: { subjects: [{ subject: "CSE", teacher: "teacherId", hoursPerWeek: 4, sessionType: "theory" }] }');
    }

  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✓ Disconnected from MongoDB');
  }
}

// Run migration
migrateClassSections()
  .then(() => {
    console.log('\n✓ Migration check complete');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n✗ Migration failed:', error);
    process.exit(1);
  });
