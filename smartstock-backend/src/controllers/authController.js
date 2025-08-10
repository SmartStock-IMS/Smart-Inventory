const AuthService = require('../services/authService');
const User = require('../models/userModel');
const ApiResponse = require('../utills/response');
const Logger = require('../utills/logger');
const { validationResult } = require('express-validator');

class AuthController {
  async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponse.validationError(res, errors.array());
      }

      const { username, email, password, first_name, last_name, role, contacts, addresses } = req.body;

      // Check if username already exists
      const existingUser = await User.findByUsername(username);
      if (existingUser) {
        return ApiResponse.error(res, 'Username already exists', 400);
      }

      // Check if email already exists (if provided)
      if (email) {
        const existingEmail = await User.findByEmail(email);
        if (existingEmail) {
          return ApiResponse.error(res, 'Email already exists', 400);
        }
      }

      const userData = { 
        username, 
        email: email || `${username}@temp.com`, 
        password, 
        first_name, 
        last_name, 
        role: role || 'sales_staff' 
      };
      
      const user = await User.createWithContacts(userData, contacts, addresses);

      Logger.info('User registered successfully', { userId: user.id, username });

      ApiResponse.success(res, {
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
          status: user.status
        },
      }, 'User registered successfully', 201);
    } catch (error) {
      Logger.error('Registration error', { error: error.message });
      ApiResponse.error(res, error.message, 500);
    }
  }

  async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return ApiResponse.validationError(res, errors.array());
      }

      const { username, password } = req.body;
      const result = await AuthService.login(username, password);

      Logger.info('User logged in successfully', { username });
      ApiResponse.success(res, result, 'Login successful');
    } catch (error) {
      Logger.error('Login error', { error: error.message });
      ApiResponse.error(res, error.message, 401);
    }
  }

  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return ApiResponse.error(res, 'Refresh token is required', 400);
      }

      const result = await AuthService.refreshToken(refreshToken);
      ApiResponse.success(res, result, 'Token refreshed successfully');
    } catch (error) {
      Logger.error('Token refresh error', { error: error.message });
      ApiResponse.error(res, error.message, 401);
    }
  }

  async getProfile(req, res) {
    try {
      const user = await User.findById(req.user.id);

      if (!user) {
        return ApiResponse.error(res, 'User not found', 404);
      }

      delete user.password_hash;
      ApiResponse.success(res, user, 'Profile retrieved successfully');
    } catch (error) {
      Logger.error('Get profile error', { error: error.message });
      ApiResponse.error(res, error.message, 500);
    }
  }

  async logout(req, res) {
    try {
      Logger.info('User logged out', { userId: req.user.id });
      ApiResponse.success(res, null, 'Logout successful');
    } catch (error) {
      Logger.error('Logout error', { error: error.message });
      ApiResponse.error(res, error.message, 500);
    }
  }
}

module.exports = new AuthController();