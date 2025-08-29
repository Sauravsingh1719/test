
import mongoose from "mongoose";

const ResultSchema = new mongoose.Schema({
  testId: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

 
  correct: { type: Number, required: true },
  wrong: { type: Number, required: true },
  unanswered: { type: Number, required: true },

  
  answers: { type: [Number], required: true }, 

 
  total: { type: Number, required: true },
  score: { type: Number, required: true },
  maxScore: { type: Number, required: true },
  percentage: { type: Number, required: true }
}, { timestamps: true });

export default mongoose.models.Result || mongoose.model("Result", ResultSchema);
