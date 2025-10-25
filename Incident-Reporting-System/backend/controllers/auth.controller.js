const RegisteredUser = require("../models/registeredUsers.model.js");
const bcrypt = require("bcryptjs");
const { generateToken } = require("../config/utils.js");
const User = require("../models/user.model.js");
const Incident = require("../models/incident.model.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");
require("dotenv").config();
const incidentModel = require("../models/incident.model.js");
const userModel = require("../models/user.model.js");
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const {uploadOnCloudinary} = require("../config/cloudinary.js");

exports.predictSeverity = async (description) => {
  try {
    const prompt = `Given the incident description: "${description}", predict its severity in one word (low, medium, high, critical).`;
    const result = await model.generateContent(prompt);
    return result.response.text().toLowerCase().trim();
  } catch (error) {
    console.error("Error generating content:", error);
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
    const {
      firstName,
      lastName,
      email,
      mobile,
      address,
      password,
    } = req.body;

    // Validate input fields
    if (
      !firstName ||
      !lastName ||
      !email ||
      !mobile ||
      !address ||
      !password 
    ) {
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
      console.log('Aadhar uploaded:', aadharCardUrl);
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
      console.log('Profile pic uploaded:', profilePicUrl);
    } catch (error) {
      console.error("Profile pic upload failed:", error);
      return res.status(400).json({
        message: "Profile picture upload failed",
        success: false,
      });
    }

    // Check if user already exists
    const existingRegisteredUser = await RegisteredUser.findOne({ email });
    const existingUser = await User.findOne({ email });

    if (existingRegisteredUser || existingUser) {
      return res.status(400).json({
        message: "User already exists",
        success: false,
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user - make sure field names match schema
    const newUser = new RegisteredUser({
      firstName,
      lastName,
      email,
      mobile,
      aadharCard: aadharCardUrl,  // This matches schema
      profilePic: profilePicUrl,   // This matches schema (not 'photo')
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
        success: false 
      });
    }
    
    res.status(500).json({ 
      message: "Internal server error", 
      success: false 
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

    if(!user) return res.status(404).json({ success: false, message: "User doesn't exist"});

    // If found in main User collection, proceed with login
    if (user) {
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

    // If not found in User collection, check RegisteredUser collection
    const registeredUser = await RegisteredUser.findOne({ email });
    if (!registeredUser) {
      return res.status(404).json({
        message: "User not found! Please register first.",
        success: false,
      });
    }

    // Check the status of the registered user
    if (registeredUser.status === "rejected") {
      return res.status(403).json({
        message:
          "Your registration has been rejected. Please contact administration.",
        success: false,
      });
    } else if (registeredUser.status === "pending") {
      return res.status(401).json({
        message:
          "Your registration is pending approval. Please wait for admin approval.",
        success: false,
      });
    } else if (registeredUser.status === "approved") {
      // This should not happen - if approved, they should be in User collection
      return res.status(500).json({
        message:
          "User approved but not found in main database. Please contact administrator.",
        success: false,
      });
    } else {
      return res.status(401).json({
        message: "Invalid registration status.",
        success: false,
      });
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
    const user = await RegisteredUser.findOne({ email });

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

exports.updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, mobile, address } = req.body;
    const userId = req.user._id;

    const updateData = {};
    if (firstName) updateData.firstName = firstName;
    if (lastName) updateData.lastName = lastName;
    if (mobile) updateData.mobile = mobile;
    if (address) updateData.address = address;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    return res.json({
      message: "Profile updated successfully",
      success: true,
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user._id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current password and new password are required",
        success: false,
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(400).json({
        message: "Current password is incorrect",
        success: false,
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await user.save();

    return res.json({
      message: "Password changed successfully",
      success: true,
    });
  } catch (error) {
    console.error("Error changing password:", error);
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

    const user = await User.findById(userId);
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
    const { notificationId } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    // Mark specific notification as read (you can add a 'read' field to notifications)
    if (user.notifications && user.notifications.length > 0) {
      user.notifications = user.notifications.filter(
        (notification) => notification._id.toString() !== notificationId
      );
      await user.save();
    }

    return res.json({
      message: "Notification marked as read",
      success: true,
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

exports.clearAllNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        message: "User not found",
        success: false,
      });
    }

    user.notifications = [];
    await user.save();

    return res.json({
      message: "All notifications cleared",
      success: true,
    });
  } catch (error) {
    console.error("Error clearing notifications:", error);
    return res.status(500).json({
      message: "Internal server error",
      success: false,
    });
  }
};

exports.reportIncident = async (req, res) => {
  const { title, description, location, severity } = req.body;
  try {
    if (!title || !description || !location || !req.file) {
      return res.status(400).json({
        message: "All fields including image are required",
        success: false,
      });
    }

    // Use predicted severity if not provided
    // const finalSeverity = severity || (await this.predictSeverity(description));

    let imageUrl = null;
    try {
        const result = await uploadOnCloudinary(req.file.buffer);
        imageUrl = result.secure_url;
    } catch (error) {
        console.log(error);
    }

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
      resolutionDetails: []
    });

    await incident.save();
    return res.status(200).json({success: true, message:"Reported successfully"});
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error reporting message",
    });
  }
};

// exports.getReport = async (req, res) => {
//     try {
//         const reportId = req.params.id;
//         const report = reportModel.findById(reportId);

//         if(!report){
//             return res.json({
//                 message: "Report not found",
//                 success: false
//             })
//         }

//         return res.json({
//             report: report,
//             success: true,
//             message : "Success in fetching report!"
//         })
//     } catch (error) {
//         console.log("Error in fetching report: ", error);
//         return res.json({
//             message: "Internal Server Error",
//             success: false
//         })
//     }
// }

// exports.viewIncident = async (req, res) => {
//   const incidentId = req.params.id;

//   try {
//     const incident = await incidentModel.findById(incidentId);

//     console.log(incident);

//     if (!incident) {
//       return res.json({
//         success: false,
//         message: "Incident doesn't exists!",
//       });
//     }

//     return res.status(200).json({
//       success: true,
//       message: "Incident fetched successfully!",
//       incident: incident,
//     });
//   } catch (error) {
//     console.log("Error in viewing incident: ", error);
//     return res.json({
//       success: false,
//       message: "Internal Server Error",
//     });
//   }
// };

// exports.viewReport = async (req, res) => {
//   const incidentId = req.params.id;
//   try {
//     const incident = await incidentModel.findById(incidentId);

//     if (!incident) {
//       return res.status(404).json({
//         // Add status code
//         success: false,
//         message: "Incident not found!",
//       });
//     }

//     return res.status(200).json({
//       // Add status code for consistency
//       success: true,
//       message: "Report fetched successfully!",
//       report: incident,
//     });
//   } catch (error) {
//     console.log("Error in fetching report: ", error);
//     return res.status(500).json({
//       // Add status code
//       success: false,
//       message: "Internal server error",
//     });
//   }
// };

exports.viewIncidents = async (req, res) => {
    try {
        console.log("🔍 viewIncidents called by user:", req.user?._id);
        console.log("🔍 User role:", req.user?.role);
        
        let incidents;
        
        // Filter incidents based on user role
        if (req.user.role === "authority") {
            // Authority can only see incidents assigned to them
            incidents = await incidentModel.find({ assignedTo: req.user._id })
                .populate('reportedBy', 'firstName lastName email')
                .populate('assignedTo', 'firstName lastName email')
                .populate('feedback.submittedBy', 'firstName lastName');;
        } else if (req.user.role === "user") {
            // Users can only see incidents they reported
            incidents = await incidentModel.find({ reportedBy: req.user._id })
                .populate('reportedBy', 'firstName lastName email')
                .populate('assignedTo', 'firstName lastName email')
                .populate('feedback.submittedBy', 'firstName lastName');
        } else {
            // Admin can see all incidents
            incidents = await incidentModel.find({})
                .populate('reportedBy', 'firstName lastName email')
                .populate('assignedTo', 'firstName lastName email')
                .populate('feedback.submittedBy', 'firstName lastName');
        }
        
        console.log(`📊 Found ${incidents.length} incidents for ${req.user.role}`);        
        console.log("📦 Sending response...");
        
        return res.json({
            message: "Incidents fetched!",
            data: incidents,
            success: true
        });
    } catch (error) {
        console.log("❌ Error fetching incidents", error);
        return res.status(500).json({
            message: "Error fetching incidents",
            success: false
        });        
    }
}

exports.submitFeedback = async (req, res) => {
  try {
    const { incidentId, feedback } = req.body;
    const userId = req.user._id;
    const userRole = req.user.role;

    console.log("📝 Submit feedback called:", { incidentId, feedback, userId, userRole });

    // Validate input
    if (!incidentId || !feedback) {
      return res.status(400).json({
        success: false,
        message: "Incident ID and feedback are required",
      });
    }

    // Find the incident and populate necessary fields
    const incident = await Incident.findById(incidentId)
      .populate('reportedBy', 'firstName lastName')
      .populate('assignedTo', 'firstName lastName');

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found",
      });
    }

    // Check who can add feedback based on role
    let canAddFeedback = false;
    let errorMessage = "";

    if (userRole === "user") {
      // User can only add feedback to their own incidents
      canAddFeedback = incident.reportedBy._id.toString() === userId.toString();
      errorMessage = "You can only add feedback to incidents you reported";
    } else if (userRole === "authority") {
      // Authority can only add feedback to incidents assigned to them
      canAddFeedback = incident.assignedTo && incident.assignedTo._id.toString() === userId.toString();
      errorMessage = "You can only add feedback to incidents assigned to you";
    } else if (userRole === "admin") {
      // Admin can add feedback to any incident
      canAddFeedback = true;
    }

    if (!canAddFeedback) {
      return res.status(403).json({
        success: false,
        message: errorMessage,
      });
    }

    // Add feedback to incident (as array)
    incident.feedback.push({
      message: feedback,
      submittedBy: userId,
      role: userRole,
      timestamp: new Date()
    });

    await incident.save();

    console.log("✅ Feedback added successfully");

    return res.json({
      success: true,
      message: "Feedback submitted successfully",
    });
  } catch (error) {
    console.error("❌ Error submitting feedback:", error);
    return res.status(500).json({
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

exports.getMessages = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    console.log("📨 Getting messages for user:", userId, "Role:", userRole);

    let messages = [];

    if (userRole === "user") {
      // For users: Get all incidents they reported and extract messages
      const userIncidents = await Incident.find({ reportedBy: userId })
        .populate('messages.sentBy', 'firstName lastName role profilePic')
        .populate('assignedTo', 'firstName lastName role')
        .select('title messages status assignedTo createdAt');

      // Extract and format messages from all incidents
      userIncidents.forEach(incident => {
        incident.messages.forEach(message => {
          messages.push({
            _id: message._id,
            text: message.text,
            sentBy: message.sentBy,
            sentAt: message.sentAt,
            incidentId: incident._id,
            incidentTitle: incident.title,
            incidentStatus: incident.status,
            assignedTo: incident.assignedTo
          });
        });
      });

    } else if (userRole === "authority") {
      // For authorities: Get messages from incidents assigned to them
      const assignedIncidents = await Incident.find({ assignedTo: userId })
        .populate('messages.sentBy', 'firstName lastName role profilePic')
        .populate('reportedBy', 'firstName lastName')
        .select('title messages status reportedBy createdAt');

      assignedIncidents.forEach(incident => {
        incident.messages.forEach(message => {
          messages.push({
            _id: message._id,
            text: message.text,
            sentBy: message.sentBy,
            sentAt: message.sentAt,
            incidentId: incident._id,
            incidentTitle: incident.title,
            incidentStatus: incident.status,
            reportedBy: incident.reportedBy
          });
        });
      });

    } else if (userRole === "admin") {
      // For admins: Get messages from all incidents
      const allIncidents = await Incident.find()
        .populate('messages.sentBy', 'firstName lastName role profilePic')
        .populate('reportedBy', 'firstName lastName')
        .populate('assignedTo', 'firstName lastName')
        .select('title messages status reportedBy assignedTo createdAt');

      allIncidents.forEach(incident => {
        incident.messages.forEach(message => {
          messages.push({
            _id: message._id,
            text: message.text,
            sentBy: message.sentBy,
            sentAt: message.sentAt,
            incidentId: incident._id,
            incidentTitle: incident.title,
            incidentStatus: incident.status,
            reportedBy: incident.reportedBy,
            assignedTo: incident.assignedTo
          });
        });
      });
    }

    // Sort messages by date (newest first)
    messages.sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt));

    console.log(`📨 Found ${messages.length} messages for ${userRole}`);

    return res.json({
      success: true,
      message: "Messages fetched successfully",
      messages: messages,
      totalCount: messages.length
    });

  } catch (error) {
    console.error("❌ Error fetching messages:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

exports.viewIncident = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Add await and populate related fields
    const incident = await incidentModel.findById(id)
      .populate('reportedBy', 'firstName lastName email')
      .populate('assignedTo', 'firstName lastName email')
      .populate('messages.sentBy', 'firstName lastName role')
      .populate('feedback.submittedBy', 'firstName lastName role');

    if (!incident) {
      return res.status(404).json({
        success: false,
        message: "Incident not found"
      });
    }

    return res.status(200).json({
      success: true, 
      incident: incident,
      message: "Incident fetched successfully"
    });
  } catch (error) {
    console.log("Error in viewIncident:", error);
    return res.status(500).json({
      success: false, 
      message: "Internal server error"
    });
  }
}
