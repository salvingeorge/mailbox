const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe } = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

// Register
router.post('/register', [
  body('username')
    .isLength({ min: 3 })
    .withMessage('Username must be at least 3 characters')
    .isAlphanumeric()
    .withMessage('Username must contain only letters and numbers'),
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('address.address')
    .notEmpty()
    .withMessage('Address is required')
], register);

// Login
router.post('/login', [
  body('username')
    .notEmpty()
    .withMessage('Username is required'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], login);

// Get current user
router.get('/me', auth, getMe);

module.exports = router;