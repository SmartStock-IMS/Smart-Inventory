const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// Routes
router.get('/', userController.getAllUsers);
//router.get('/profile', userController.getUserProfile);

// Resource Manager specific routes
router.get('/resource-managers', userController.getAllResourceManagers);
router.get('/resource-managers/:id', userController.getResourceManagerById);

// General user routes
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
