const protectRoute = require("../middleware/auth.middleware.js");
const express = require("express");
const router = express.Router();
const {
  login,
  signup,
  reportIncident,
  // viewReport,
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

router.get("/debug/users", async (req, res) => {
  try {
    const User = require("../models/user.model.js");
    const RegisteredUser = require("../models/registeredUsers.model.js");

    const users = await User.find({}).select("email role createdAt");
    const registeredUsers = await RegisteredUser.find({}).select(
      "email status createdAt"
    );

    res.json({
      users: users,
      registeredUsers: registeredUsers,
      userCount: users.length,
      registeredUserCount: registeredUsers.length,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
  console.log(req.user.notifications);     // <-- check output!
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
// router.put("/update-profile", protectRoute, updateProfile);
router.put("/change-password", protectRoute, changePassword);
router.get('/profile',protectRoute, getProfile)

// Incident and report viewing
router.get("/view-incident/:id", protectRoute, viewIncident)
router.get("/view-incidents", protectRoute, viewIncidents);
router.get("/messages", protectRoute, getMessages);
// router.get("/view-report/:id", protectRoute, viewReport);

// Feedback
router.post("/submit-feedback", protectRoute, submitFeedback);

module.exports = router;