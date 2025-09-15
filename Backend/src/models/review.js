import mongoose from 'mongoose'


// For schema for category rating
const CategorySchema = new mongoose.Schema({
    key: { type: String, required: true },
    rating: { type: Number } // nullable
  }, { _id: false })


  // review schema

  const ReviewSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true }, // composite: 'hostaway:<id>'
    id: { type: String, required: true },                // review id as string
    channel: { type: String, required: true },           // 'hostaway'
    type: { type: String, required: true },
    status: { type: String, required: true },
    rating: { type: Number },                            // may be null
    categories: { type: [CategorySchema], default: [] },
    comment: { type: String, default: '' },
    guest: { type: String, default: 'Guest' },
    listing: { type: String, required: true },           // we group by listing name
    submittedAt: { type: Date },                         // may be null
    approved: { type: Boolean, default: false }          // manager to flag  
  }, { timestamps: true })

ReviewSchema.index({ listing: 1, submittedAt: 1 })
ReviewSchema.index({ rating: 1 })
ReviewSchema.index({ channel: 1 })

export const Review = mongoose.model('Review', ReviewSchema)