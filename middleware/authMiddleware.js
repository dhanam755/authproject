const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'mysecretkey';
const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, access denied' });
  }
  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = { id: decoded.id };

    next();
  } catch (error) {
    res.status(401).json({ message: 'Token invalid' });
  }
};

module.exports = authMiddleware;
