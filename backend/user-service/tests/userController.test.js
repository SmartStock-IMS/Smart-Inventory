const UserController = require('../src/controllers/userController');
const UserModel = require('../src/models/userModel');

// Mock the user model
jest.mock('../src/models/userModel');

describe('UserController', () => {
  let userController;
  let req, res;
  
  beforeEach(() => {
    userController = new UserController();
    
    req = {
      body: {},
      params: {},
      query: {},
      user: {} // For authenticated requests
    };
    
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis()
    };
    
    // Reset all mocks
    jest.clearAllMocks();
  });
  
  describe('getAllUsers', () => {
    test('should return all users with default pagination', async () => {
      // Arrange
      const mockUsers = [
        { 
          id: 1, 
          username: 'admin', 
          email: 'admin@example.com', 
          role: 'administrator',
          first_name: 'Admin',
          last_name: 'User'
        },
        { 
          id: 2, 
          username: 'manager', 
          email: 'manager@example.com', 
          role: 'inventory_manager',
          first_name: 'Manager',
          last_name: 'User'
        }
      ];
      
      UserModel.findAll = jest.fn().mockResolvedValue(mockUsers);
      
      // Act
      await userController.getAllUsers(req, res);
      
      // Assert
      expect(UserModel.findAll).toHaveBeenCalledWith(10, 0, {});
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Users retrieved successfully',
        data: {
          users: mockUsers,
          pagination: {
            page: 1,
            limit: 10
          }
        }
      });
    });
    
    test('should return users with role filter', async () => {
      // Arrange
      req.query = {
        page: '1',
        limit: '5',
        role: 'administrator'
      };
      
      const mockUsers = [
        { 
          id: 1, 
          username: 'admin', 
          email: 'admin@example.com', 
          role: 'administrator'
        }
      ];
      
      UserModel.findAll = jest.fn().mockResolvedValue(mockUsers);
      
      // Act
      await userController.getAllUsers(req, res);
      
      // Assert
      expect(UserModel.findAll).toHaveBeenCalledWith(5, 0, { role: 'administrator' });
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Users retrieved successfully',
        data: {
          users: mockUsers,
          pagination: {
            page: 1,
            limit: 5
          }
        }
      });
    });
    
    test('should handle database errors', async () => {
      // Arrange
      const errorMessage = 'Database connection failed';
      UserModel.findAll = jest.fn().mockRejectedValue(new Error(errorMessage));
      
      // Act
      await userController.getAllUsers(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: errorMessage
      });
    });
  });
  
  describe('getUserById', () => {
    test('should return user by id without password', async () => {
      // Arrange
      req.params = { id: '1' };
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'sales_rep',
        password_hash: 'hashed_password_should_be_removed'
      };
      
      UserModel.findById = jest.fn().mockResolvedValue({ ...mockUser });
      
      // Act
      await userController.getUserById(req, res);
      
      // Assert
      expect(UserModel.findById).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      
      const responseCall = res.json.mock.calls[0][0];
      expect(responseCall.success).toBe(true);
      expect(responseCall.data.user).not.toHaveProperty('password_hash');
      expect(responseCall.data.user.username).toBe('testuser');
    });
    
    test('should return 404 when user not found', async () => {
      // Arrange
      req.params = { id: '999' };
      UserModel.findById = jest.fn().mockResolvedValue(null);
      
      // Act
      await userController.getUserById(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found'
      });
    });
  });
  
  describe('createUser', () => {
    test('should create new user successfully', async () => {
      // Arrange
      req.body = {
        username: 'newuser',
        email: 'newuser@example.com',
        password: 'password123',
        role: 'sales_rep',
        first_name: 'New',
        last_name: 'User'
      };
      
      const mockCreatedUser = {
        id: 3,
        username: 'newuser',
        email: 'newuser@example.com',
        role: 'sales_rep',
        first_name: 'New',
        last_name: 'User',
        created_at: new Date()
      };
      
      UserModel.create = jest.fn().mockResolvedValue(mockCreatedUser);
      
      // Act
      await userController.createUser(req, res);
      
      // Assert
      expect(UserModel.create).toHaveBeenCalledWith(req.body);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'User created successfully',
        data: { user: mockCreatedUser }
      });
    });
    
    test('should handle duplicate email error', async () => {
      // Arrange
      req.body = {
        username: 'newuser',
        email: 'existing@example.com',
        password: 'password123'
      };
      
      const duplicateError = new Error('Email already exists');
      UserModel.create = jest.fn().mockRejectedValue(duplicateError);
      
      // Act
      await userController.createUser(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Email already exists'
      });
    });
  });
  
  describe('updateUser', () => {
    test('should update user successfully', async () => {
      // Arrange
      req.params = { id: '1' };
      req.body = {
        first_name: 'Updated',
        last_name: 'Name',
        role: 'inventory_manager'
      };
      
      const mockExistingUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com'
      };
      
      const mockUpdatedUser = {
        ...mockExistingUser,
        ...req.body
      };
      
      UserModel.findById = jest.fn().mockResolvedValue(mockExistingUser);
      UserModel.update = jest.fn().mockResolvedValue(mockUpdatedUser);
      
      // Act
      await userController.updateUser(req, res);
      
      // Assert
      expect(UserModel.findById).toHaveBeenCalledWith('1');
      expect(UserModel.update).toHaveBeenCalledWith('1', req.body);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'User updated successfully',
        data: { user: mockUpdatedUser }
      });
    });
    
    test('should return 404 when updating non-existent user', async () => {
      // Arrange
      req.params = { id: '999' };
      req.body = { first_name: 'Updated' };
      
      UserModel.findById = jest.fn().mockResolvedValue(null);
      
      // Act
      await userController.updateUser(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found'
      });
    });
  });
  
  describe('deleteUser', () => {
    test('should delete user successfully', async () => {
      // Arrange
      req.params = { id: '1' };
      
      const mockUser = {
        id: 1,
        username: 'testuser',
        role: 'sales_rep'
      };
      
      UserModel.findById = jest.fn().mockResolvedValue(mockUser);
      UserModel.delete = jest.fn().mockResolvedValue(true);
      
      // Act
      await userController.deleteUser(req, res);
      
      // Assert
      expect(UserModel.findById).toHaveBeenCalledWith('1');
      expect(UserModel.delete).toHaveBeenCalledWith('1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'User deleted successfully'
      });
    });
    
    test('should return 400 when trying to delete administrator', async () => {
      // Arrange
      req.params = { id: '1' };
      
      const mockAdminUser = {
        id: 1,
        username: 'admin',
        role: 'administrator'
      };
      
      UserModel.findById = jest.fn().mockResolvedValue(mockAdminUser);
      
      // Act
      await userController.deleteUser(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Cannot delete administrator user'
      });
    });
    
    test('should return 404 when deleting non-existent user', async () => {
      // Arrange
      req.params = { id: '999' };
      
      UserModel.findById = jest.fn().mockResolvedValue(null);
      
      // Act
      await userController.deleteUser(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'User not found'
      });
    });
  });
  
  describe('changePassword', () => {
    test('should change password successfully', async () => {
      // Arrange
      req.params = { id: '1' };
      req.body = {
        current_password: 'oldpassword',
        new_password: 'newpassword123'
      };
      
      const mockUser = {
        id: 1,
        username: 'testuser',
        password_hash: 'hashed_old_password'
      };
      
      UserModel.findById = jest.fn().mockResolvedValue(mockUser);
      UserModel.verifyPassword = jest.fn().mockResolvedValue(true);
      UserModel.updatePassword = jest.fn().mockResolvedValue(true);
      
      // Act
      await userController.changePassword(req, res);
      
      // Assert
      expect(UserModel.verifyPassword).toHaveBeenCalledWith('1', 'oldpassword');
      expect(UserModel.updatePassword).toHaveBeenCalledWith('1', 'newpassword123');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Password changed successfully'
      });
    });
    
    test('should return 400 for incorrect current password', async () => {
      // Arrange
      req.params = { id: '1' };
      req.body = {
        current_password: 'wrongpassword',
        new_password: 'newpassword123'
      };
      
      const mockUser = { id: 1, username: 'testuser' };
      
      UserModel.findById = jest.fn().mockResolvedValue(mockUser);
      UserModel.verifyPassword = jest.fn().mockResolvedValue(false);
      
      // Act
      await userController.changePassword(req, res);
      
      // Assert
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: 'Current password is incorrect'
      });
    });
  });
});