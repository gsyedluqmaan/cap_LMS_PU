/**
 * Check database state - see what data exists
 */

import mongoose from 'mongoose';
import '../src/models/ClassSection';
import '../src/models/Room';
import '../src/models/User';

async function connectDB() {
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/lms';
  try {
    await mongoose.connect(mongoUri);
    console.log('✓ Connected to MongoDB\n');
  } catch (error) {
    console.error('✗ MongoDB connection error:', error);
    process.exit(1);
  }
}

async function checkState() {
  await connectDB();

  try {
    const ClassSection = mongoose.model('ClassSection');
    const Room = mongoose.model('Room');
    const User = mongoose.model('User');

    const classSections = await ClassSection.countDocuments();
    const rooms = await Room.countDocuments();
    const users = await User.countDocuments();
    const teachers = await User.countDocuments({ role: 'teacher' });
    const students = await User.countDocuments({ role: 'student' });
    const admins = await User.countDocuments({ role: 'admin' });

    console.log('='.repeat(60));
    console.log('DATABASE STATE');
    console.log('='.repeat(60));
    console.log(`Class Sections: ${classSections}`);
    console.log(`Rooms: ${rooms}`);
    console.log(`Users: ${users}`);
    console.log(`  - Admins: ${admins}`);
    console.log(`  - Teachers: ${teachers}`);
    console.log(`  - Students: ${students}`);
    console.log('='.repeat(60));

    if (classSections === 0) {
      console.log('\n⚠ No class sections found!');
      console.log('You need to create class sections before generating timetables.\n');
      console.log('To create a class section, use the admin interface or API:');
      console.log('POST /api/class-sections');
    }

    if (rooms === 0) {
      console.log('\n⚠ No rooms found!');
      console.log('You need to add rooms before generating timetables.\n');
      console.log('To add rooms, use the admin interface or API:');
      console.log('POST /api/rooms');
    }

    if (teachers === 0) {
      console.log('\n⚠ No teachers found!');
      console.log('You need to add teachers before creating class sections.\n');
    }

  } catch (error) {
    console.error('Error checking database state:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n✓ Disconnected from MongoDB');
  }
}

checkState()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error);
    process.exit(1);
  });
