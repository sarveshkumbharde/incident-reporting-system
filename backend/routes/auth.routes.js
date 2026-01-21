const protectRoute = require("../middleware/auth.middleware.js");
const express = require("express");
const router = express.Router();
const {
  login,
  signup,
  reportIncident,
  getMessages,
  viewIncident,
  viewIncidents,
  checkApproval,
  adminSignUp,
  getNotifications,
  logout,
  authoritySignUp,
  changePassword,
  getProfile,
  getUserIncidents,
  markNotificationAsRead,
  markAllNotificationsRead,
  clearAllNotifications,
  getCurrentUser,
  submitFeedback,
} = require("../controllers/auth.controller.js");
const upload = require("../middleware/multer.middleware.js");

// Authentication routes
router.post("/login", login);
router.post(
  "/signup",
  upload.fields([
    { name: "aadharCard", maxCount: 1 },
    { name: "profilePic", maxCount: 1 },
  ]),
  signup
);
router.post("/admin-signup", adminSignUp);
router.post("/authority-signup", authoritySignUp);
router.post("/logout", logout);

// Session verification
router.get("/me", protectRoute, getCurrentUser);
router.get("/debug/notifications", protectRoute, (req, res) => {
  console.log(req.user.notifications);    
  res.json(req.user.notifications);
});

// User functionality
router.post("/check-approval", checkApproval);
router.post(
  "/report-incident",
  protectRoute,
  upload.single("image"),
  reportIncident
);
router.get("/notifications", protectRoute, getNotifications);
router.post("/mark-all-notifications-read", protectRoute, markAllNotificationsRead); // optional
router.post("/mark-notification-read", protectRoute, markNotificationAsRead);
router.delete("/clear-notifications", protectRoute, clearAllNotifications);
router.get("/user-incidents", protectRoute, getUserIncidents);
router.get('/profile',protectRoute, getProfile)

// Incident and report viewing
router.get("/view-incident/:id", protectRoute, viewIncident)
router.get("/view-incidents", protectRoute, viewIncidents);

// Feedback
router.post("/submit-feedback", protectRoute, submitFeedback);

module.exports = router;