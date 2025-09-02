import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dbConnect from "@/app/lib/dbConnect";

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  phoneNumber: String,
  role: { 
    type: String, 
    required: true, 
    enum: ['admin', 'teacher', 'student'], 
    default: 'student'
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: function() {
      return this.role === 'teacher';
    }
  }
}, { timestamps: true });


UserSchema.index({ username: 1, email: 1 }, { unique: true });

UserSchema.index({ role: 1 });


UserSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});


const User = mongoose.models.User || mongoose.model("User", UserSchema);


async function createAdminUser() {
  await dbConnect();
  const existing = await User.findOne({ role: "admin" });
  
  if (!existing && process.env.ADMIN_EMAIL && process.env.ADMIN_PASSWORD) {
    const admin = await User.create({
      username: "admin",
      email: process.env.ADMIN_EMAIL,
      password: process.env.ADMIN_PASSWORD,
      name: "System Admin",
      role: "admin",
      phoneNumber: ""
    });
    
    console.log("✅ Admin user created with ID:", admin._id);
    return admin;
  }
}

if (process.env.RUN_ADMIN_SEED === "true") {
  createAdminUser().catch(console.error);
}

export default User;
