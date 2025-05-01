import mongoose from "mongoose";

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" , required: true },
},  {
    timestamps: true,
});

CategorySchema.index({ name: 1 }, { unique: true });
CategorySchema.index({ createdBy: 1 });

export default mongoose.models.Category || mongoose.model("Category", CategorySchema);