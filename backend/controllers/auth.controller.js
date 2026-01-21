const bcrypt = require("bcryptjs");
const { generateToken } = require("../config/utils.js");
const User = require("../models/user.model.js");
const Incident = require("../models/incident.model.js");
require("dotenv").config();
const incidentModel = require("../models/incident.model.js");
const userModel = require("../models/user.model.js");
const { uploadOnCloudinary } = require("../config/cloudinary.js");
const { sendNotification } = require("../utils/sendNotification");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("reportedIncidents") // 🔥 FULL incident objects
      .populate("assignedIncidents")
      .populate({
        path: "notifications.incidentId",
        select: "title status",
      }); // 🔥 If authority
    // notifications are embedded, no need to populate them

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

exports.adminSignUp = async (req, res) => {
  try {
    const { firstName, lastName, email, mobile, address, password } = req.body;

    // Validate input fields
    if (!firstName || !lastName || !email || !mobile || !address || !password) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    // Check if the admin already exists
    const existingAdmin = await User.findOne({ email, role: "admin" });
    if (existingAdmin) {
      return res.status(400).json({
        message: "Admin with this email already exists",
        success: false,
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new admin user
    const newAdmin = new User({
      firstName,
      lastName,
      email,
      mobile,
      address,
      password: hashedPassword,
      role: "admin", // Explicitly set the role as 'admin'
    });

    // Save the admin user to the database
    await newAdmin.save();

    // Generate JWT token
    const token = generateToken(newAdmin._id, res);

    // Send response
    res.status(201).json({
      message: "Admin registered successfully",
      success: true,
      token,
      admin: {
        id: newAdmin._id,
        firstName: newAdmin.firstName,
        lastName: newAdmin.lastName,
        email: newAdmin.email,
        role: newAdmin.role,
      },
    });
  } catch (error) {
    console.error("Error in adminSignUp: ", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

exports.authoritySignUp = async (req, res) => {
  try {
    const { firstName, lastName, email, mobile, address, password } = req.body;

    // Validate input fields
    if (!firstName || !lastName || !email || !mobile || !address || !password) {
      return res.status(400).json({
        message: "All fields are required, including Aadhar Card.",
        success: false,
      });
    }

    // Check if the admin already exists
    const existingAdmin = await User.findOne({ email, role: "authority" });
    if (existingAdmin) {
      return res.status(400).json({
        message: "Authority with this email already exists.",
        success: false,
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new admin user
    const newAuthority = new User({
      firstName,
      lastName,
      email,
      mobile,
      address,
      password: hashedPassword,
      aadharCard,
      role: "authority",
      assignedIncidents: [],
      reportedIncidents: [],
      notifications: [],
    });

    // Save the admin user to the database
    await newAuthority.save();

    // Generate JWT token
    const token = generateToken(newAuthority._id, res);

    // Send response
    res.status(201).json({
      message: "Authority registered successfully.",
      success: true,
      token,
      authority: {
        id: newAuthority._id,
        firstName: newAuthority.firstName,
        lastName: newAuthority.lastName,
        email: newAuthority.email,
        role: newAuthority.role,
        assignedIncidents: newAuthority.assignedIncidents,
        reportedIncidents: newAuthority.reportedIncidents,
        aadharCard: newAuthority.aadharUrl,
        profilePic: newAuthority.profileUrl,
        notifications: newAuthority.notifications,
      },
    });
  } catch (error) {
    console.error("Error in authority SignUp: ", error);
    res.status(500).json({
      message: "Internal server error.",
      success: false,
    });
  }
};

exports.signup = async (req, res) => {
  try {
    const { firstName, lastName, email, mobile, address, password } = req.body;

    // Check if all required fields are provided
    if (!firstName || !lastName || !email || !mobile || !address || !password) {
      return res.status(400).json({
        message: "All fields are required",
        success: false,
      });
    }

    // Ensure the required files were uploaded
    if (!req.files || !req.files.aadharCard || !req.files.profilePic) {
      return res.status(400).json({
        message: "Aadhar card and profile picture are required",
        success: false,
      });
    }

    let aadharCardUrl = null;
    let profilePicUrl = null;

    // Upload Aadhar card
    try {
      const result = await uploadOnCloudinary(req.files.aadharCard[0].buffer);
      aadharCardUrl = result.secure_url;
      console.log("Aadhar uploaded:", aadharCardUrl);
    } catch (error) {
      console.error("Aadhar upload failed:", error);
      return res.status(400).json({
        message: "Aadhar card upload failed",
        success: false,
      });
    }

    // Upload profile picture
    try {
      const result = await uploadOnCloudinary(req.files.profilePic[0].buffer);
      profilePicUrl = result.secure_url;
      console.log("Profile pic uploaded:", profilePicUrl);
    } catch (error) {
      console.error("Profile pic upload failed:", error);
      return res.status(400).json({
        message: "Profile picture upload failed",
        success: false,
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
        success: false,
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user - make sure field names match schema
    const newUser = new User({
      firstName,
      lastName,
      email,
      mobile,
      aadharCard: aadharCardUrl, // This matches schema
      profilePic: profilePicUrl, // This matches schema (not 'photo')
      address,
      password: hashedPassword,
      status: "pending",
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully. Please wait for admin approval.",
      success: true,
      userId: newUser._id,
    });
  } catch (error) {
    console.error("Error in signup: ", error);

    // Handle specific MongoDB errors
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: `User with this ${field} already exists`,
        success: false,
      });
    }

    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input fields
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
        success: false,
      });
    }

    console.log(email);

    // First check if user exists in the main User collection (approved users)
    let user = await User.findOne({ email });

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User doesn't exist" });

    // If found in main User collection, proceed with login
    if (user) {
      if (user.status === "pending") {
        return res.status(401).json({
          message:
            "Your registration is pending approval. Please wait for admin approval.",
          success: false,
        });
      } else if (user.status === "rejected") {
        // This should not happen - if approved, they should be in User collection
        return res.status(500).json({
          message: "You're registration is rejected by admin.",
          success: false,
        });
      } else if ((user.status = "approved")) {
        // Check password validity
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return res.status(401).json({
            message: "Invalid credentials",
            success: false,
          });
        }

        // Generate JWT token
        const token = generateToken(user._id, res);

        // Send response
        return res.json({
          message: "Login successful!",
          success: true,
          token,
          userId: user._id,
          user: user,
        });
      }
    }

   
  } catch (error) {
    console.error("Error in login: ", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

exports.logout = async (req, res) => {
  try {
    res.cookie("jwt", "", { maxAge: 0, httpOnly: true });
    res.status(200).json({
      message: "Logout successful!",
      success: true,
    });
  } catch (error) {
    console.error("Error in logout: ", error);
    res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

exports.checkApproval = async (req, res) => {
  try {
    const { email } = req.body;

    // Check if email is provided
    if (!email) {
      return res.status(400).json({
        message: "Email is required",
        success: false,
      });
    }

    // Find the user by email
    const user = await User.findOne({ email });

    // Handle case where user is not found
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Create response message and status
    const msg = `Your status is: ${user.status}`;
    const isApproved = user.status === "approved";

    // Send response
    return res.status(200).json({
      message: msg,
      success: isApproved,
    });
  } catch (error) {
    console.error("Error in fetching status: ", error);

    // Handle server error
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

exports.getUserIncidents = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log("getUserIncidents - User ID:", userId);
    console.log("getUserIncidents - User email:", req.user.email);
    console.log("getUserIncidents - User role:", req.user.role);

    const incidents = await Incident.find({ reportedBy: userId }).sort({
      createdAt: -1,
    });

    console.log("getUserIncidents - Found incidents:", incidents.length);
    console.log("getUserIncidents - Incidents:", incidents);

    return res.json({
      message: "User incidents fetched successfully",
      success: true,
      incidents,
    });
  } catch (error) {
    console.error("Error fetching user incidents:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

exports.getNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select("notifications");
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    return res.json({
      message: "Notifications fetched successfully",
      success: true,
      notifications: user.notifications || [],
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

exports.markNotificationAsRead = async (req, res) => {
  try {
    const { notificationId } = req.body; // FIXED
    const userId = req.user._id;

    if (!notificationId) {
      return res.status(400).json({
        success: false,
        message: "Notification ID is required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Locate the notification inside user.notifications array
    const notification = user.notifications.id(notificationId);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    notification.isRead = true; // UPDATE THE FIELD
    await user.save();

    return res.json({
      success: true,
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error("Error marking notification read:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.markAllNotificationsRead = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    user.notifications.forEach((n) => (n.isRead = true));
    await user.save();
    return res.json({ success: true, message: "All marked read" });
  } catch (err) {
    console.error("markAllNotificationsRead error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

exports.clearAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    user.notifications = []; // Clear all
    await user.save();

    return res.json({
      success: true,
      message: "All notifications cleared",
    });
  } catch (error) {
    console.error("Error clearing notifications:", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

exports.reportIncident = async (req, res) => {
  try {
    const { title, description, location, severity } = req.body;

    if (!title || !description || !location || !req.file) {
      return res.status(400).json({
        success: false,
        message: "All fields including image are required",
      });
    }

    // Upload image to cloudinary
    let imageUrl = null;
    try {
      const result = await uploadOnCloudinary(req.file.buffer);
      imageUrl = result.secure_url;
    } catch (error) {
      console.log(error);
    }

    // Create incident
    const incident = new Incident({
      title,
      description,
      location,
      severity,
      reportedBy: req.user._id,
      image: imageUrl,
      assignedTo: null,
      messages: [],
      feedback: [],
      resolutionDetails: [],
    });

    await incident.save();
    const io = req.app.get("io");
    console.log("🔥 IO INSTANCE:", !!io);

    // ⭐ Notify the user
    await sendNotification(
      req.user._id,
      `Your incident "${title}" has been reported successfully.`,
      incident._id,
      "success",
      io,
    );

    // ⭐ Notify all admins
    const admins = await User.find({ role: "admin" });

    for (const admin of admins) {
      await sendNotification(
        admin._id,
        `A new incident "${title}" has been reported by ${req.user.firstName}.`,
        incident._id,
        "warning",
        io,
      );
    }

    return res.status(200).json({
      success: true,
      message: "Reported successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Error reporting message",
    });
  }
};

exports.viewIncidents = async (req, res) => {
  try {
    console.log("🔍 viewIncidents called by user:", req.user?._id);
    console.log("🔍 User role:", req.user?.role);

    let incidents;

    // Filter incidents based on user role
    if (req.user.role === "authority") {
      // Authority can only see incidents assigned to them
      incidents = await incidentModel
        .find({ assignedTo: req.user._id })
        .populate("reportedBy", "firstName lastName email")
        .populate("assignedTo", "firstName lastName email")
        .populate("feedback.submittedBy", "firstName lastName");
    } else if (req.user.role === "user") {
      // Users can only see incidents they reported
      incidents = await incidentModel
        .find({ reportedBy: req.user._id })
        .populate("reportedBy", "firstName lastName email")
        .populate("assignedTo", "firstName lastName email")
        .populate("feedback.submittedBy", "firstName lastName");
    } else {
      // Admin can see all incidents
      incidents = await incidentModel
        .find({})
        .populate("reportedBy", "firstName lastName email")
        .populate("assignedTo", "firstName lastName email")
        .populate("feedback.submittedBy", "firstName lastName");
    }

    console.log(`📊 Found ${incidents.length} incidents for ${req.user.role}`);
    console.log("📦 Sending response...");

    return res.json({
      message: "Incidents fetched!",
      data: incidents,
      success: true,
    });
  } catch (error) {
    console.log("❌ Error fetching incidents", error);
    return res.status(500).json({
      message: "Error fetching incidents",
      success: false,
    });
  }
};

exports.submitFeedback = async (req, res) => {
  try {
    const { incidentId, feedback } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    if (!incidentId || !feedback) {
      return res.status(400).json({
        success: false,
        message: "Incident ID and feedback are required",
      });
    }

    // Find incident
    let incident = await Incident.findById(incidentId);
    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found",
      });
    }

    // Permission logic
    let isAllowed =
      (userRole === "user" &&
        incident.reportedBy.toString() === userId.toString()) ||
      (userRole === "authority" &&
        incident.assignedTo?.toString() === userId.toString()) ||
      userRole === "admin";

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to add feedback to this incident",
      });
    }

    // Add feedback
    incident.feedback.push({
      message: feedback,
      submittedBy: userId,
      role: userRole,
      timestamp: new Date(),
    });

    await incident.save();

    // ✔️ Fetch updated + populated incident
    incident = await Incident.findById(incidentId)
      .populate("reportedBy", "firstName lastName email")
      .populate("assignedTo", "firstName lastName email");

    return res.json({
      success: true,
      message: "Feedback submitted successfully",
      incident, // <-- return full updated incident
    });
  } catch (error) {
    console.error("❌ Feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.getCurrentUser = async (req, res) => {
  try {
    // The user is already attached to req by the auth middleware
    const user = req.user;

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Return user data without sensitive information
    const userData = {
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mobile: user.mobile,
      address: user.address,
      role: user.role,
      aadharCard: user.aadharCard,
      profilePic: user.profilePic,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    res.status(200).json({
      success: true,
      user: userData,
    });
  } catch (error) {
    console.error("Error in getCurrentUser:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

exports.viewIncident = async (req, res) => {
  try {
    const { id } = req.params;

    // Add await and populate related fields
    const incident = await incidentModel
      .findById(id)
      .populate("reportedBy", "firstName lastName email")
      .populate("assignedTo", "firstName lastName email")
      // .populate("messages.sentBy", "firstName lastName role")
      .populate("feedback.submittedBy", "firstName lastName role");

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found",
      });
    }

    return res.status(200).json({
      success: true,
      incident: incident,
      message: "Incident fetched successfully",
    });
  } catch (error) {
    console.log("Error in viewIncident:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
