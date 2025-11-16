const incidentModel = require('../models/incident.model')
const User = require('../models/user.model')
const mongoose = require('mongoose');
const { sendNotification } = require("../utils/sendNotification");

exports.getIncidentById = async (req, res) => {
    const incidentId = req.params.id;

    try {
        const incident = incidentModel.findById(incidentId);

        if(!incident){
            return res.status(404).json({ message: 'Incident not found' });
        }

        return res.json({ 
            incident: incident,
            message : "Fetched event"
        })
    } catch (error) {
        console.log("Error in fetching incident by ID: ", error);
        return res.json({
            message: "Error in fetching incident by ID",
            success : false,
        })
    }
}

exports.viewIncidents = async (req, res) => {
    try {
        const incidents = await incidentModel.find({});
        console.log(incidents);        
        return res.json({
            message : "Incidents fetched!",
            data : incidents,
            success : true
        });
    } catch (error) {
        console.log("Error fetching incidents",  error);
        return res.status(500).json({
            message : "Error fetching incidents",
            success : false
        });        
    }
}

// exports.markIncidentAsSolved = async (req, res) => {
//     try {
//         const incidentId = req.params.id;

//         const incident = await incidentModel.findById(incidentId);
//         if (!incident) {
//             return res.status(404).json({ message: "Incident not found.", success: false });
//         }

//         if (incident.status === 'resolved') {
//             return res.status(400).json({ message: "Incident is already resolved.", success: false });
//         }

//         incident.status = 'resolved';
//         await incident.save();

//         const reportedBy = await User.findById(incident.reportedBy);

//         const msg = `The case "${incident.title}" is resolved. Please check the reports section.`;
//         if (reportedBy && reportedBy.notifications) {
//             reportedBy.notifications.push({
//                 text: msg,
//                 incidentId: incidentId,
//             });
//             await reportedBy.save();
//         }

//         return res.json({
//             message: "Incident marked as resolved, and report generated.",
//             success: true,
//             updatedIncident: incident,
//             // generatedReport: report,
//         });
        
//     } catch (error) {
//         console.error("Error marking incident as resolved:", error);
//         return res.status(500).json({ message: "Internal server error.", success: false });
//     }
// };


exports.getUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // Fetch the user by ID
        const user = await User.findById(userId).lean(); 

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }
        
        const filteredUser = {
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            mobile: user.mobile,
            address: user.address,
            profilePic: user.profilePic,
            email: user.email,
            role: user.role,
        };

        console.log(filteredUser);        

        return res.status(200).json({
            success: true,
            user: filteredUser,
        });
    } catch (error) {
        console.error("Error in fetching user: ", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// exports.updateIncidentStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status } = req.body;
//     const user = req.user;

//     const allowedStatuses = ["reported", "under review", "in progress", "resolved", "dismissed"];

//     if (user.role !== "authority") {
//       return res.status(403).json({ success: false, message: "Only authority can update incident status" });
//     }

//     if (!allowedStatuses.includes(status)) {
//       return res.status(400).json({ success: false, message: "Invalid status" });
//     }

//     const incident = await incidentModel.findByIdAndUpdate(id, { status }, { new: true });
//     if (!incident) {
//       return res.status(404).json({ success: false, message: "Incident not found" });
//     }

//     res.status(200).json({ success: true, message: "Status updated", incident });
//   } catch (error) {
//     console.error("Error updating incident:", error);
//     res.status(500).json({ success: false, message: "Internal server error" });
//   }
// };

exports.sendMessageToReporter = async (req, res) => {
  try {
    const { id } = req.params; // incident id
    const { message } = req.body;
    const user = req.user;

    if (user.role !== "authority") {
      return res.status(403).json({ success: false, message: "Only authority can send messages" });
    }

    const incident = await incidentModel.findById(id);
    if (!incident) {
      return res.status(404).json({ success: false, message: "Incident not found" });
    }

    incident.messages.push({
      text: message,
      sentBy: user._id,
      sentAt: new Date(),
    });

    await incident.save();

    res.status(200).json({ success: true, message: "Message sent successfully", incident });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};


// exports.assignIncident = async (req, res) => {
//     try {
//         const { incidentId, assignedTo } = req.body;

//         if (!incidentId || !assignedTo) {
//             return res.status(400).json({
//                 message: "Incident ID and assigned user are required",
//                 success: false
//             });
//         }

//         const incident = await incidentModel.findById(incidentId);
//         if (!incident) {
//             return res.status(404).json({
//                 message: "Incident not found",
//                 success: false
//             });
//         }

//         const assignedUser = await User.findById(assignedTo);
//         if (!assignedUser || assignedUser.role !== 'authority') {
//             return res.status(400).json({
//                 message: "Invalid authority user",
//                 success: false
//             });
//         }

//         incident.assignedTo = assignedTo;
//         incident.status = 'under review';
//         await incident.save();

//         // Add notification to assigned authority
//         assignedUser.notifications.push({
//             text: `You have been assigned incident: ${incident.title}`,
//             incidentId: incidentId
//         });
//         await assignedUser.save();

//         return res.json({
//             message: "Incident assigned successfully",
//             success: true,
//             incident
//         });
//     } catch (error) {
//         console.error("Error assigning incident:", error);
//         return res.status(500).json({
//             message: "Internal server error",
//             success: false
//         });
//     }
// };

exports.updateIncidentStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const {id} = req.params;

        const incidentId = id;

        if (!incidentId || !status) {
            return res.status(400).json({
                message: "Incident ID and status are required",
                success: false
            });
        }

        // Include ALL valid statuses used in your frontend
        const validStatuses = [
            "reported",
            "under review",
            "in progress",
            "resolved",
            "dismissed"
        ];

        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                message: "Invalid status",
                success: false
            });
        }

        const incident = await incidentModel.findById(incidentId);
        if (!incident) {
            return res.status(404).json({
                message: "Incident not found",
                success: false
            });
        }

        // Update status
        incident.status = status;
        await incident.save();

        // Add notification to reporter
        await sendNotification(
            incident.reportedBy,
            `Your incident "${incident.title}" is now "${status}".`,
            incidentId,
            "info"
        );

        return res.json({
            success: true,
            message: "Incident status updated successfully",
            incident
        });

    } catch (error) {
        console.error("Error updating incident status:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};


exports.getAssignedIncidents = async (req, res) => {
    try {
        const authorityId = req.user._id;
        
        const incidents = await incidentModel.find({ assignedTo: authorityId })
            .populate('reportedBy', 'firstName lastName email')
            .sort({ createdAt: -1 });

        return res.json({
            message: "Assigned incidents fetched successfully",
            success: true,
            incidents
        });
    } catch (error) {
        console.error("Error fetching assigned incidents:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

exports.getAuthorityDashboard = async (req, res) => {
    try {
        const authorityId = req.user._id;

        // Get counts for different incident statuses
        const totalAssigned = await incidentModel.countDocuments();
        const resolvedCount = await incidentModel.countDocuments({ 
           
            status: 'resolved' 
        });
        const inProgressCount = await incidentModel.countDocuments({ 
          
            status: 'under review' 
        });
        const pendingCount = await incidentModel.countDocuments({ 
         
            status: 'reported' 
        });

        // Get recent incidents
        const recentIncidents = await incidentModel.find({ assignedTo: authorityId })
            .populate('reportedBy', 'firstName lastName email')
            .sort({ createdAt: -1 })
            .limit(5);

        return res.json({
            success: true,
            stats: {
                totalAssigned,
                resolvedCount,
                inProgressCount,
                pendingCount,
                resolutionRate: totalAssigned > 0 ? ((resolvedCount / totalAssigned) * 100).toFixed(2) : 0
            },
            recentIncidents
        });
    } catch (error) {
        console.error("Error fetching authority dashboard:", error);
        return res.status(500).json({
            message: "Internal server error",
            success: false
        });
    }
};

exports.getFeedback = async (req, res) => {
    try {
        // Get all incidents with feedback
        const incidentsWithFeedback = await incidentModel.find({
            feedback: { $exists: true, $ne: null }
        }).populate('reportedBy', 'firstName lastName');

        const feedbackData = incidentsWithFeedback.map(incident => ({
            _id: incident._id,
            incident: {
                _id: incident._id,
                title: incident.title
            },
            text: incident.feedback.text,
            rating: incident.feedback.rating,
            submittedAt: incident.feedback.submittedAt,
            reporter: incident.reportedBy
        }));

        return res.json({
            success: true,
            feedback: feedbackData
        });
    } catch (error) {
        console.error("Error fetching feedback:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};