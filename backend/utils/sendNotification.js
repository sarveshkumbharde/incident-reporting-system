const User = require("../models/user.model.js");

exports.sendNotification = async (userId, text, incidentId, type = "info") => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    user.notifications.push({
      text,
      incidentId,
      type,
      isRead: false, // IMPORTANT
      createdAt: new Date(),
    });

    await user.save();
  } catch (err) {
    console.error("Notification error:", err);
  }
};
