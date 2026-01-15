const express = require('express');
const router = express.Router();
const auth = require('../controllers/authController');

router.post('/signup', auth.signup);
router.post('/verify-otp', auth.verifyOTP);
router.post('/login', auth.login);
router.post('/forgot-password', auth.forgotPassword);
router.post('/reset-password', auth.resetPassword);
router.post('/logout', auth.logout);

module.exports = router;
