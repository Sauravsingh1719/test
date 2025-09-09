
import mongoose from "mongoose";

const RankSchema = new mongoose.Schema({
  testId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Test", 
    required: true 
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  percentage: { 
    type: Number, 
    required: true 
  },
  timeTaken: { 
    type: Number, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
});


RankSchema.index({ testId: 1, userId: 1 }, { unique: true });


RankSchema.index({ testId: 1, percentage: -1, timeTaken: 1 });

export default mongoose.models.Rank || mongoose.model("Rank", RankSchema);