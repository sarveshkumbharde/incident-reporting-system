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

        const io = req.app.get('io');
        // Add notification to reporter
        await sendNotification(
            incident.reportedBy,
            `Your incident "${incident.title}" is now "${status}".`,
            incidentId,
            "info",
            io
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