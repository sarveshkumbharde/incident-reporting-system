const registeredUsersModel = require("../models/registeredUsers.model");
const User = require("../models/user.model.js");
const Incident = require("../models/incident.model.js");
const bcrypt = require("bcryptjs");
const { sendNotification } = require("../utils/sendNotification");

exports.verify = async (req, res) => {
  try {
    const id = req.params.id;
    const { approval } = req.body;

    console.log("Id: ", id, " Approval: ", approval);

    if (!id || approval == null) {
      return res.status(400).json({
        success: false,
        message: "User ID and approval status are required",
      });
    }

    const user = await registeredUsersModel.findById(id);

    console.log(user);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.status !== "pending") {
      return res.status(400).json({
        success: false,
        message: `User is already ${user.status}`,
      });
    }

    if (approval === true) {
      // Approve user - create new user in main database
      const name = `${user.firstName} ${user.lastName}`;
      const newUser = new User({
        name: name,
        email: user.email,
        address: user.address,
        aadharCard: user.aadharCard,
        profilePic: user.profilePic,
        mobile: user.mobile,
        firstName: user.firstName,
        lastName: user.lastName,
        password: user.password,
        role: "user", // Make sure this field exists in your User model
      });

      await newUser.save();

      // Update status to approved instead of deleting
      user.status = "approved";
      await user.save();

      return res.status(200).json({
        success: true,
        message: "User approved successfully",
      });
    } else {
      // Reject user - update status
      user.status = "rejected";
      await user.save();

      return res.status(200).json({
        success: true,
        message: "User rejected successfully",
      });
    }
  } catch (error) {
    console.error("Error in user verification:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.viewRegistrations = async (req, res) => {
  try {
    // Fetch all registered users
    const registeredUsers = await registeredUsersModel.find();

    if (!registeredUsers.length) {
      return res.status(404).json({
        success: false,
        message: "No registered users found",
      });
    }

    // Format the response to include necessary fields
    const formattedUsers = registeredUsers.map((user) => ({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobile: user.mobile,
      status: user.status, // Include the approval status
      aadharCard: user.aadharCard,
      photo: user.photo,
      createdAt: user.createdAt,
    }));

    return res.status(200).json({
      success: true,
      users: formattedUsers,
    });
  } catch (error) {
    console.error("Error in viewing registrations: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.removeUser = async (req, res) => {
  try {
    const userId = req.params.ID;

    const response = await User.findByIdAndDelete(userId);

    if (response) {
      res.json({
        success: true,
        message: "User deleted successfully",
      });
    } else {
      res.json({
        success: false,
        message: "User not found", // Handle case when user is not found
      });
    }
  } catch (error) {
    console.error("Error in deleting user: ", error); // Log the error for debugging
    res.status(500).json({
      success: false,
      message: "Internal server error", // Return appropriate error response
    });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).select("-password");

    return res.status(200).json({
      success: true,
      users: users,
      count: users.length,
    });
  } catch (error) {
    console.error("Error in fetching all users: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User deleted successfully!" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to delete user" });
  }
};

exports.getAllAuthorities = async (req, res) => {
  try {
    const authorities = await User.find({ role: "authority" }).select(
      "firstName lastName email _id"
    );
    res.json({ success: true, authorities: authorities });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Error fetching authorities" });
  }
};

exports.assignIncident = async (req, res) => {
    try {
        const incidentId = req.params.id
        const { authorityId } = req.body;

        const incident = await Incident.findById(incidentId);
        if (!incident)
            return res.status(404).json({ success: false, message: "Incident not found" });

        incident.assignedTo = authorityId;
        await incident.save();

        // 🔥 Notify authority
        await sendNotification(
            authorityId,
            `You have been assigned a new incident: "${incident.title}".`,
            incidentId,
            "warning"
        );

        // 🔥 Notify user who reported it
        await sendNotification(
            incident.reportedBy,
            `Your incident "${incident.title}" has been assigned to an authority.`,
            incidentId,
            "info"
        );

        res.json({ success: true, message: "Incident assigned successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.getDashboardStats = async (req, res) => {
  try {
    // Get counts for different entities
    const totalUsers = await User.countDocuments({ role: "user" });
    const pendingRegistrations = await registeredUsersModel.countDocuments({
      status: "pending",
    });
    const totalIncidents = await Incident.countDocuments();
    const resolvedIncidents = await Incident.countDocuments({
      status: "resolved",
    });
    const openIncidents = await Incident.countDocuments({ status: "reported" });
    const inProgressIncidents = await Incident.countDocuments({
      status: "under review",
    });

    // Get recent incidents
    const recentIncidents = await Incident.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("reportedBy", "firstName lastName email");

    // Get monthly incident trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyStats = await Incident.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { "_id.year": 1, "_id.month": 1 },
      },
    ]);

    return res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        pendingRegistrations,
        totalIncidents,
        resolvedIncidents,
        openIncidents,
        inProgressIncidents,
        resolutionRate:
          totalIncidents > 0
            ? ((resolvedIncidents / totalIncidents) * 100).toFixed(2)
            : 0,
      },
      recentIncidents,
      monthlyStats,
    });
  } catch (error) {
    console.error("Error in fetching dashboard stats: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
