const User = require("../models/user.model.js");
const { transporter } = require("./mailer");

exports.sendNotification = async (
  userId,
  message,
  incidentId,
  type = "info",
  io,
) => {
  try {
    console.log("[Notifications] Delivering notification", {
      userId: userId?.toString(),
      incidentId: incidentId?.toString?.() || incidentId || null,
      type,
    });

    const user = await User.findById(userId);
    if (!user) {
      console.warn("[Notifications] Target user not found", {
        userId: userId?.toString(),
      });
      return null;
    }

    const notification = {
      text: message,
      ...(incidentId ? { incidentId } : {}),
      type,
      isRead: false,
      createdAt: new Date(),
    };

    user.notifications.unshift(notification);
    if (user.notifications.length > 50) {
      user.notifications.pop();
    }

    await user.save();

    const savedNotification = user.notifications[0]?.toObject
      ? user.notifications[0].toObject()
      : user.notifications[0];

    console.log("[Notifications] Notification persisted", {
      userId: user._id.toString(),
      notificationId: savedNotification?._id?.toString() || null,
    });

    const room = userId.toString();
    
    let activeSockets = [];
    if (io) {
      try {
        activeSockets = await io.in(room).fetchSockets();
      } catch (err) {
        console.error("[Notifications] Error checking active sockets for room:", room, err);
      }
    }

    if (activeSockets && activeSockets.length > 0) {
      io.to(room).emit("notification", savedNotification);
      console.log("[Notifications] Realtime notification emitted", {
        userId: user._id.toString(),
        room,
        sockets: activeSockets.length,
        notificationId: savedNotification?._id?.toString() || null,
      });
      return savedNotification;
    }

    console.log("[Notifications] User offline; sending email fallback", {
      userId: user._id.toString(),
      email: user.email,
      notificationId: savedNotification?._id?.toString() || null,
    });

    try {
      await transporter.sendMail({
        to: user.email,
        subject: "New Notification",
        html: `
          <p>Hello ${user.firstName},</p>
          <p>${message}</p>
          ${incidentId ? `<p><b>Incident ID:</b> ${incidentId}</p>` : ""}
          <hr />
          <small>Incident Reporting System</small>
        `,
      });
      console.log("[Notifications] Email fallback sent directly", {
        userId: user._id.toString(),
        email: user.email,
      });
    } catch (error) {
      console.error("[Notifications] Email fallback failed:", error.message);
    }

    return savedNotification;
  } catch (error) {
    console.error("[Notifications] Delivery failed:", error);
    return null;
  }
};
