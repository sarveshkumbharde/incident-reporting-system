const protectRoute = require('../middleware/auth.middleware.js');
const adminProtect = require('../middleware/admin.middleware.js');
const User = require('../models/user.model.js')
const express = require('express');
const router = express.Router();
const { removeUser, viewRegistrations, verify, getDashboardStats, getAllUsers, getAllAuthorities, assignIncident, deleteUser} = require('../controllers/admin.controllers.js');
const {viewIncidents} = require('../controllers/authority.controllers.js');

// User approval and management
router.post('/verify/:id', protectRoute, adminProtect, verify);
router.delete('/remove-user/:id', protectRoute, adminProtect, removeUser);
router.get('/view-registrations', protectRoute, adminProtect, viewRegistrations);
router.get('/all-users', protectRoute, adminProtect, getAllUsers);
router.get('/all-authorities', protectRoute, adminProtect, getAllAuthorities); 
router.delete('/delete-user/:id', protectRoute, adminProtect, deleteUser);

// Dashboard and statistics
router.get('/dashboard-stats', protectRoute, adminProtect, getDashboardStats);
router.get('/view-incidents', protectRoute, adminProtect, viewIncidents);
router.put("/assign/:id", protectRoute, assignIncident);

console.log("✅ Admin routes file loaded!");

module.exports = router; 