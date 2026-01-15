const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const sendEmail = require('../utils/sendEmail');
const generateOTP  = require('../utils/generateOTP');

const JWT_SECRET = process.env.JWT_SECRET || 'mysecretkey';

exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields required' });
    }

    const exists = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (exists.rows.length) return res.status(400).json({ message: 'User already exists' });

    const hashed = await bcrypt.hash(password, 10);
    const otp = generateOTP(); // e.g., "123456"
    const expiry = new Date(Date.now() + 10 * 60000); // 10 mins

    await pool.query(
      `INSERT INTO users (username,email,password,otp,otp_expiry,is_verified)
      VALUES ($1,$2,$3,$4,$5,false)`,
      [username, email, hashed, otp, expiry]
    );

    try {
      await sendEmail(email, 'OTP Verification', `Your OTP is ${otp}. Expires in 10 mins.`);
      console.log('OTP sent to:', email);
    } catch (err) {
      console.error('Email failed:', err.message);
    }

    res.status(201).json({ message: 'Signup successful. OTP sent.' });
  } catch (err) {
    console.error('Signup error:', err.message);
    res.status(500).json({ error: err.message });
  }
};


exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email & OTP required' });

    const user = await pool.query('SELECT otp, otp_expiry, is_verified FROM users WHERE email=$1', [email]);
    if (!user.rows.length) return res.status(404).json({ message: 'User not found' });

    const { otp: dbOTP, otp_expiry, is_verified } = user.rows[0];
    if (is_verified) return res.status(400).json({ message: 'User already verified' });
    if (dbOTP !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (new Date() > otp_expiry) return res.status(400).json({ message: 'OTP expired' });

    await pool.query('UPDATE users SET is_verified=true, otp=NULL, otp_expiry=NULL WHERE email=$1', [email]);

    res.json({ message: 'Email verified successfully' });
  } catch (err) {
    console.error('Verify OTP error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'All fields required' });

    const user = await pool.query('SELECT id, password, is_verified FROM users WHERE email=$1', [email]);
    if (!user.rows.length) return res.status(404).json({ message: 'User not found' });

    const { id, password: dbPassword, is_verified } = user.rows[0];
    if (!is_verified) return res.status(401).json({ message: 'Verify email first' });

    const match = await bcrypt.compare(password, dbPassword);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Login successful', token });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: err.message });
  }
};
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const user = await pool.query('SELECT id FROM users WHERE email=$1', [email]);
    if (!user.rows.length) return res.status(404).json({ message: 'User not found' });

    const resetToken = generateOTP(); 
    const expiry = new Date(Date.now() + 15 * 60000); 

    await pool.query('UPDATE users SET reset_token=$1, reset_expiry=$2 WHERE email=$3', [resetToken, expiry, email]);

    try {
      await sendEmail(email, 'Password Reset', `Your reset OTP is ${resetToken}. Expires in 15 mins.`);
      console.log('Reset OTP sent to:', email);
    } catch (err) {
      console.error('Reset email failed:', err.message);
    }

    res.json({ message: 'Password reset OTP sent to email' });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ message: 'All fields required' });

    const user = await pool.query('SELECT reset_token, reset_expiry FROM users WHERE email=$1', [email]);
    if (!user.rows.length) return res.status(404).json({ message: 'User not found' });

    const { reset_token, reset_expiry } = user.rows[0];
    if (reset_token !== otp) return res.status(400).json({ message: 'Invalid OTP' });
    if (new Date() > reset_expiry) return res.status(400).json({ message: 'OTP expired' });

    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password=$1, reset_token=NULL, reset_expiry=NULL WHERE email=$2',
      [hashed, email]
    );

    res.json({ message: 'Password reset successfully' });
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(500).json({ error: err.message });
  }
};

exports.logout = async (req, res) => {

  res.json({ message: 'Logged out successfully' });
};
