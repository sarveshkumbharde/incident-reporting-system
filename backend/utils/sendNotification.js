// const User = require("../models/user.model.js");

// exports.sendNotification = async (userId, text, incidentId, type = "info") => {
//   try {
//     const user = await User.findById(userId);
//     if (!user) return;

//     user.notifications.push({
//       text,
//       incidentId,
//       type,
//       isRead: false, // IMPORTANT
//       createdAt: new Date(),
//     });

//     await user.save();
//   } catch (err) {
//     console.error("Notification error:", err);
//   }
// };


const User = require("../models/user.model.js");
const { getUserSocket } = require("../sockets");
const { sendMail } = require("./mailer");

exports.sendNotification = async (
  userId,
  message,
  incidentId,
  type = "info",
  io
) => {
  const user = await User.findById(userId);
  if (!user) return;

  const notification = {
    text: message,
    incidentId,
    type,
    isRead: false,
    createdAt: new Date(),
  };

  user.notifications.unshift(notification);
  if (user.notifications.length > 50) {
  user.notifications.pop(); // drop oldest
}
  await user.save();

  // 🔴 REAL-TIME
  const socketId = getUserSocket(userId);
  console.log("📡 socketId for", userId, "=", socketId);

  if (socketId && io) {
    io.to(socketId).emit("notification", notification);
    return;
  }

  // 🟡 OFFLINE → EMAIL
  await sendMail({
    to: user.email,
    subject: "New Notification",
    html: `
      <p>Hello ${user.firstName},</p>
      <p>${message}</p>
      <p><b>Incident ID:</b> ${incidentId}</p>
      <hr />
      <small>Incident Reporting System</small>
    `,
  });
};
