import mongoose from 'mongoose';
import connectDB from '../src/lib/db';
import ClassSection from '../src/models/ClassSection';

async function fixStudentObjectIds() {
  try {
    await connectDB();
    console.log('Connected to database');

    // Find all class sections
    const classSections = await ClassSection.find({});
    console.log(`Found ${classSections.length} class sections`);

    let fixedCount = 0;

    for (const section of classSections) {
      let needsUpdate = false;
      const fixedStudents: mongoose.Types.ObjectId[] = [];

      console.log(`\nChecking section: ${section.classCode} (${section.className})`);
      console.log(`Current students:`, section.students);

      for (const student of section.students) {
        // Check if student is already an ObjectId
        if (student instanceof mongoose.Types.ObjectId) {
          fixedStudents.push(student);
          console.log(`  ✓ ${student} is already ObjectId`);
        } else if (typeof student === 'string') {
          // Convert string to ObjectId
          try {
            const objectId = new mongoose.Types.ObjectId(student);
            fixedStudents.push(objectId);
            needsUpdate = true;
            console.log(`  ✗ ${student} converted from string to ObjectId`);
          } catch (error) {
            console.log(`  ✗ ${student} is invalid ObjectId, skipping`);
          }
        } else {
          console.log(`  ? Unknown type for student:`, typeof student, student);
        }
      }

      if (needsUpdate) {
        // Update the document directly in the database
        await mongoose.connection.collection('classsections').updateOne(
          { _id: section._id },
          { $set: { students: fixedStudents } }
        );
        fixedCount++;
        console.log(`  ✓ Updated section ${section.classCode}`);
      } else {
        console.log(`  ✓ Section ${section.classCode} already has correct format`);
      }
    }

    console.log(`\n✅ Fixed ${fixedCount} class sections`);
    console.log('\nVerifying fixes...');

    // Verify the fixes
    const verifySection = await ClassSection.findOne({ classCode: '711' });
    if (verifySection) {
      console.log('\nVerification - Section 711:');
      console.log('Students:', verifySection.students);
      console.log('First student type:', typeof verifySection.students[0]);
      console.log('Is ObjectId?', verifySection.students[0] instanceof mongoose.Types.ObjectId);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error fixing student ObjectIds:', error);
    process.exit(1);
  }
}

fixStudentObjectIds();
