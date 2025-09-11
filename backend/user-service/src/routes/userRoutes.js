const express = require('express');
const userController = require('../controllers/userController');

const router = express.Router();

// Routes

router.get('/', userController.getAllUsers);
//router.get('/profile', userController.getUserProfile);
router.get('/sales-staff', userController.getSalesStaff);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);


module.exports = router;
