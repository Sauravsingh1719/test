
import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
    questionText: { 
        type: String, 
        required: [true, "Question text is required"],
        minlength: [10, "Question must be at least 10 characters"]
    },
    options: {
        type: [String],
        required: true,
        validate: {
            validator: function(options: string[]) {
                return options.length === 4 && 
                       options.every(opt => opt.trim().length > 0);
            },
            message: "Exactly 4 non-empty options required"
        }
    },
    correctAnswer: {
        type: Number,
        required: [true, "Correct answer index is required"],
        min: [0, "Answer index must be between 0-3"],
        max: [3, "Answer index must be between 0-3"]
    },
    explanation: {
        type: String,
        default: ""
    }
}, { _id: true });

const TestSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: [true, "Test title is required"],
        trim: true,
        maxlength: [100, "Title cannot exceed 100 characters"]
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: [true, "Category is required"]
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    description: { 
        type: String, 
        default: "",
        maxlength: [500, "Description cannot exceed 500 characters"]
    },
    questions: {
        type: [QuestionSchema],
        validate: {
            validator: function(questions: any[]) {
                return questions.length >= 5 && questions.length <= 100;
            },
            message: "Test must contain between 5-100 questions"
        }
    },
    duration: { 
        type: Number, 
        required: [true, "Duration is required"],
        min: [5, "Minimum duration is 5 minutes"],
        max: [180, "Maximum duration is 3 hours"]
    },
    marks: {
        correct: { 
            type: Number, 
            default: 1 
        },
        wrong: { 
            type: Number, 
            default: 0 
        },
        unanswered: { 
            type: Number, 
            default: 0 
        }
    }
}, { 
    timestamps: true  
});

// Indexes
TestSchema.index({ title: 1 });
TestSchema.index({ category: 1 });
TestSchema.index({ createdBy: 1 });
TestSchema.index({ createdAt: -1 });

export default mongoose.models.Test || mongoose.model("Test", TestSchema);