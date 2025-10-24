const express = require('express');
const { body } = require('express-validator');
const userController = require('../controllers/userController');

const router = express.Router();

// Routes
router.get('/', userController.getAllUsers);
router.get('/profile/:id', userController.getUserProfile);
router.get('/sales-staff', userController.getSalesStaff);
router.get('/resource-manager', userController.getResourceManager);
router.get('/:id', userController.getUserById);
router.get('/notifications/:id', userController.getUserNotifications);
router.put('/notifications/:id/read', userController.markNotificationsAsRead);
router.put('/:id', userController.updateUser);
router.put('/password/:id', userController.changePassword);
router.delete('/:id', userController.deleteUser);

// Resource Manager specific routes
router.put('/resource-manager/:id', userController.updateResourceManager);
router.delete('/resource-manager/:id', userController.deleteResourceManager);

module.exports = router;
