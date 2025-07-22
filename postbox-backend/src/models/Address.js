const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
    unique: true
  },
  movie: {
    type: String,
    required: true
  },
  isCustom: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Address', addressSchema);