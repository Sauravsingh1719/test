import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dbConnect from "@/app/lib/dbConnect";

const UserSchema = new mongoose.Schema({
  username:     { type: String, required: true, unique: true },
  password:     { type: String, required: true, select: false },
  email:        { type: String, required: true, unique: true },
  name:         { type: String, required: true },
  phoneNumber:  { type: String },
  role:         { type: String, enum: ["admin","student","teacher"], default: "student" },
  createdAt:    { type: Date, default: Date.now },
});


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
    await User.create({
      username:   "admin",
      email:      process.env.ADMIN_EMAIL,
      password: await bcrypt.hash(process.env.ADMIN_PASSWORD, 10),    
      name:       "System Admin",
      role:       "admin",
      phoneNumber:""
    });
    console.log("✅ Admin user created");
  }
}

if (process.env.RUN_ADMIN_SEED === "true") {
  createAdminUser().catch(console.error);
}

export default User;
