const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

class AuthService {
  generateTokens(user) {
    // Handle both UserID and id field naming conventions
    const userId = user.UserID || user.id || user.userid;
    
    const payload = {
      id: userId,
      username: user.username,
      email: user.email,
      role: user.role,
      role_id: user.role_id
    };

    const accessToken = jwt.sign(
      payload,
      process.env.JWT_SECRET || 'sem5-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );

    const refreshToken = jwt.sign(
      { id: userId },
      process.env.JWT_REFRESH_SECRET || 'sem5-refresh-secret',
      { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
    );

    return { accessToken, refreshToken };
  }

    async login(email, password) {
      try {
        
        let user = await UserModel.findByEmail(email);
        
        if (!user) {
          throw new Error('No user found');
        }

  
        // Validate password using the userModel method
        const isValidPassword = await UserModel.validatePassword(password, user.password_hash);
        if (!isValidPassword) {
          throw new Error('Invalid credentials');
        }
  
        // Update last login
        await UserModel.updateLastLogin(user.userid);
        const tokens = this.generateTokens(user);
  
        // Remove sensitive data
        delete user.password_hash;
        return { user, ...tokens };
      } catch (error) {
        throw error;
      }
    }

  async register(userData) {
    try {
      //const userModel = new UserModel();
      
      // Check if user already exists by email
      const existingUserByEmail = await UserModel.findByEmail(userData.email);
      if (existingUserByEmail) {
        throw new Error('Email already exists');
      }

      // Create new user using userModel
      const user = await UserModel.create(userData);

      // Generate tokens
      const tokens = this.generateTokens(user);

      // Remove sensitive data
      delete user.password_hash;
      return {
        user,
        ...tokens
      };
    } catch (error) {
      throw error;
    }
  }

  async refreshToken(refreshToken) {
    try {
      const decoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET || 'sem5-refresh-secret'
      );

      const user = await UserModel.findById(decoded.id);

      const tokens = this.generateTokens(user);
      return tokens;
    } catch (error) {
      throw new Error('Invalid refresh token');
    }
  }

  async validateToken(token) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'sem5-secret-key'
      );
      
      const user = await UserModel.findById(decoded.id);
      console.log(user);

      // Remove sensitive data
      delete user.password_hash;
      return user;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

module.exports = new AuthService();
