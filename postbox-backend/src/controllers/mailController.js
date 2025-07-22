const Mail = require('../models/Mail');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Get User's Mail
const getMail = async (req, res) => {
  try {
    const { page = 1, limit = 50, type, isRead } = req.query;
    
    const filter = { recipient: req.user.id };
    if (type) filter.type = type;
    if (isRead !== undefined) filter.isRead = isRead === 'true';

    const mail = await Mail.find(filter)
      .populate('sender', 'username address')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Mail.countDocuments(filter);
    const unreadCount = await Mail.countDocuments({ 
      recipient: req.user.id, 
      isRead: false 
    });

    res.json({
      success: true,
      mail,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      },
      unreadCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send Mail
const sendMail = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { recipientAddress, subject, content, type = 'letter' } = req.body;

    // Find recipient by address
    const recipient = await User.findOne({
      'address.address': recipientAddress
    });

    if (!recipient) {
      return res.status(404).json({ 
        message: 'No user found with this address' 
      });
    }

    const mail = await Mail.create({
      sender: req.user.id,
      recipient: recipient._id,
      recipientAddress,
      subject,
      content,
      type
    });

    await mail.populate('sender', 'username address');
    await mail.populate('recipient', 'username address');

    res.status(201).json({
      success: true,
      mail
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark Mail as Read
const markAsRead = async (req, res) => {
  try {
    const { mailId } = req.params;

    const mail = await Mail.findOneAndUpdate(
      { _id: mailId, recipient: req.user.id },
      { 
        isRead: true, 
        readAt: new Date() 
      },
      { new: true }
    ).populate('sender', 'username address');

    if (!mail) {
      return res.status(404).json({ message: 'Mail not found' });
    }

    res.json({
      success: true,
      mail
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Single Mail
const getSingleMail = async (req, res) => {
  try {
    const { mailId } = req.params;

    const mail = await Mail.findOne({
      _id: mailId,
      $or: [
        { recipient: req.user.id },
        { sender: req.user.id }
      ]
    })
    .populate('sender', 'username address')
    .populate('recipient', 'username address');

    if (!mail) {
      return res.status(404).json({ message: 'Mail not found' });
    }

    res.json({
      success: true,
      mail
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Mail
const deleteMail = async (req, res) => {
  try {
    const { mailId } = req.params;

    const mail = await Mail.findOneAndDelete({
      _id: mailId,
      recipient: req.user.id
    });

    if (!mail) {
      return res.status(404).json({ message: 'Mail not found' });
    }

    res.json({
      success: true,
      message: 'Mail deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Sent Mail
const getSentMail = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;

    const mail = await Mail.find({ sender: req.user.id })
      .populate('recipient', 'username address')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Mail.countDocuments({ sender: req.user.id });

    res.json({
      success: true,
      mail,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMail,
  sendMail,
  markAsRead,
  getSingleMail,
  deleteMail,
  getSentMail
};