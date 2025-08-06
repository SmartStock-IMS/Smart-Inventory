const jwt = require('jsonwebtoken');
const config = require('../config/config');
const User = require('../models/userModel');

class AuthService {
  generateTokens(user) {
    const payload = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });

    const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, {
      expiresIn: config.jwt.refreshExpiresIn,
    });

    return { accessToken, refreshToken };
  }

  async login(username, password) {
    try {
      const user = await User.findByUsername(username);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      if (!user.is_active) {
        throw new Error('Account is deactivated');
      }

      const isValidPassword = await User.validatePassword(password, user.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      await User.updateLastLogin(user.id);
      const tokens = this.generateTokens(user);

      delete user.password_hash;
      return { user, ...tokens };
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
      const user = await User.findById(decoded.id);

      if (!user || !user.is_active) {
        throw new Error('Invalid refresh token');
      }

      const tokens = this.generateTokens(user);
      delete user.password_hash;

      return { user, ...tokens };
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }
}

module.exports = new AuthService();