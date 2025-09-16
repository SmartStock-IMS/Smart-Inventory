const jwt = require('jsonwebtoken');
const prismaUserModel = require('../models/prismaUserModel');

class AuthService {
  generateTokens(user) {
    // Handle both UserID and id field naming conventions
    const userId = user.userID || user.id || user.userid;
    
    const payload = {
      id: userId,
      username: user.username,
      email: user.email,
      role: user.role
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
        
        let user = await prismaUserModel.findByEmail(email);
        
        if (!user) {
          throw new Error('No user found');
        }

  
        // Validate password using the userModel method
        const isValidPassword = await prismaUserModel.validatePassword(password, user.password_hash);
        if (!isValidPassword) {
          throw new Error('Invalid credentials');
        }
  
        // Update last login
        await prismaUserModel.updateLastLogin(user.userID);
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
      // Check if user already exists by email
      const existingUserByEmail = await prismaUserModel.findByEmail(userData.email);
      if (existingUserByEmail) {
        throw new Error('Email already exists');
      }

      // Create new user using prismaUserModel
      const user = await prismaUserModel.create(userData);

      // Generate tokens
      const tokens = this.generateTokens(user);

      // Return user and tokens (password_hash is already excluded from the model)
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

      const user = await prismaUserModel.findById(decoded.id);

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
      
      const user = await prismaUserModel.findById(decoded.id);
      console.log('Token validation - found user:', user);

      return user; // password_hash is already excluded from the model
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

module.exports = new AuthService();
