import mongoose from "mongoose";


const TestSchema = new mongoose.Schema({
    title: { 
      type: String, 
      required: true 
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    description: { 
      type: String, 
      default: "" 
    },
    questions: [
      {
        questionText: { 
          type: String, 
          required: true 
        },
        options: {
          type: [String],
          validate: [
            {
              validator: (options:any) => options.length === 4,
              message: "Exactly 4 options required"
            }
          ]
        },
        correctAnswer: {
          type: Number, 
          required: true,
          min: 0,      
          max: 3
        },
        explanation: {
          type: String,
        }
      }
    ],
    duration: { 
      type: Number, 
      required: true 
    },
    isPublished: { 
      type: Boolean, 
      default: false 
    }
  }, { 
    timestamps: true  
  });
  

  TestSchema.index({ category: 1 });
  TestSchema.index({ createdBy: 1 });

export default mongoose.models.Test || mongoose.model("Test", TestSchema);
