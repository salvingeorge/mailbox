const mongoose = require('mongoose');

const mailSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  recipientAddress: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [200, 'Subject cannot exceed 200 characters']
  },
  content: {
    type: String,
    required: [true, 'Content is required'],
    maxlength: [10000, 'Content cannot exceed 10000 characters']
  },
  type: {
    type: String,
    enum: ['letter', 'postcard'],
    default: 'letter'
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  attachments: [{
    filename: String,
    url: String,
    size: Number
  }],
  priority: {
    type: String,
    enum: ['low', 'normal', 'high'],
    default: 'normal'
  }
}, {
  timestamps: true
});

// Index for faster queries
mailSchema.index({ recipient: 1, createdAt: -1 });
mailSchema.index({ sender: 1, createdAt: -1 });

module.exports = mongoose.model('Mail', mailSchema);