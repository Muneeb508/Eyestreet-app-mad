const mongoose = require('mongoose');

const issueSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: [
        'Garbage',
        'Water',
        'Sewer',
        'Roads',
        'Electricity',
        'Streetlights',
        'Traffic',
        'Other',
      ],
      required: true,
    },
    location: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true },
    },
    address: { type: String },
    status: {
      type: String,
      enum: ['pending', 'inProgress', 'resolved'],
      default: 'pending',
    },
    imageUrls: [{ type: String }],
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

module.exports = mongoose.model('Issue', issueSchema);


