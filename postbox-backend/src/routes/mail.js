const express = require('express');
const { body } = require('express-validator');
const {
  getMail,
  sendMail,
  markAsRead,
  getSingleMail,
  deleteMail,
  getSentMail
} = require('../controllers/mailController');
const auth = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(auth);

// Get user's mail
router.get('/', getMail);

// Get sent mail
router.get('/sent', getSentMail);

// Get single mail
router.get('/:mailId', getSingleMail);

// Send mail
router.post('/send', [
  body('recipientAddress')
    .notEmpty()
    .withMessage('Recipient address is required'),
  body('subject')
    .isLength({ min: 1, max: 200 })
    .withMessage('Subject is required and must be less than 200 characters'),
  body('content')
    .isLength({ min: 1, max: 10000 })
    .withMessage('Content is required and must be less than 10000 characters'),
  body('type')
    .optional()
    .isIn(['letter', 'postcard'])
    .withMessage('Type must be either letter or postcard')
], sendMail);

// Mark mail as read
router.patch('/:mailId/read', markAsRead);

// Delete mail
router.delete('/:mailId', deleteMail);

module.exports = router;