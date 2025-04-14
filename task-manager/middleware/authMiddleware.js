const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = 'your_jwt_secret';

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      next();
    } catch (err) {
      return res.status(401).json({ msg: 'Not authorized, token failed' });
    }
  } else {
    return res.status(401).json({ msg: 'Not authorized, no token' });
  }
};

module.exports = protect;
