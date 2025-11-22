import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined in .env.local');
  process.exit(1);
}


interface IUser {
  isVerified: boolean;
  verifyCode?: string;
  verifyCodeExpiry?: Date;
}


const userSchema = new mongoose.Schema<IUser>({
  isVerified: {
    type: Boolean,
    default: false,
  },
  verifyCode: {
    type: String,
    required: false,
  },
  verifyCodeExpiry: {
    type: Date,
    required: false,
  },
}, { strict: false }); 

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function migrateUsers() {
  try {
    console.log('🚀 Starting migration...');
    console.log(`📡 Connecting to database...`);

    // 3. Connect to MongoDB
    await mongoose.connect(MONGODB_URI as string);
    console.log('✅ Connected to MongoDB');
    
    console.log('🔄 Updating user documents...');
    
    const result = await User.updateMany(
      {}, // Filter: {} selects ALL users
      {
        $set: { 
          isVerified: true 
        },
        $unset: { 
          verifyCode: "", 
          verifyCodeExpiry: "" 
        }
      }
    );

    console.log(`✨ Migration complete!`);
    console.log(`📊 Stats:`);
    console.log(`   - Matched Documents: ${result.matchedCount}`);
    console.log(`   - Modified Documents: ${result.modifiedCount}`);
    console.log(`   - Upserted Documents: ${result.upsertedCount}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    // 5. Cleanup
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

migrateUsers();