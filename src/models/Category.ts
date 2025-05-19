import mongoose from 'mongoose';

const SubcategorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    default: '' 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  }
}, { timestamps: true });

const CategorySchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true 
  },
  description: { 
    type: String, 
    default: '' 
  },
  createdBy: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  subcategories: [SubcategorySchema]
}, { timestamps: true });


CategorySchema.index({ createdBy: 1 });
CategorySchema.index({ 'subcategories._id': 1 });

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);