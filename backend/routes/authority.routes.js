const protectRoute = require('../middleware/auth.middleware.js');
const authorityProtect = require('../middleware/authority.middleware.js')
const express = require('express');
const {viewIncidents, getUser, sendMessageToReporter, updateIncidentStatus, getAssignedIncidents, getAuthorityDashboard, getFeedback} = require('../controllers/authority.controllers.js')
const router = express.Router();

// View incidents
router.get('/view-incidents', protectRoute, authorityProtect, viewIncidents);
router.get('/assigned-incidents', protectRoute, authorityProtect, getAssignedIncidents);

// Incident management
router.put('/update-status/:id', protectRoute, authorityProtect, updateIncidentStatus);


// Dashboard
router.get('/dashboard', protectRoute, authorityProtect, getAuthorityDashboard);

// User management
router.get('/user/:id', protectRoute, authorityProtect, getUser);

// Feedback
router.get('/feedback', protectRoute, authorityProtect, getFeedback);

module.exports = router;