const mongoose = require('mongoose');

const incidentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true
    },
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    image: {
        type: String,
        required: true
    },
    severity: {
        type: String,
        enum: ['low', 'medium', 'high', 'critical'],
        default: 'high'
    },
    status: {
        type: String,
        enum: ['reported', 'under review', 'in progress', 'resolved', 'dismissed'],
        default: 'reported'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    feedback: [{
        message: {
            type: String,
            required: true
        },
        submittedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String, 
            enum: ['user', 'authority', 'admin'],
            required: true
        },
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
}, { 
    timestamps: true 
});

incidentSchema.index({ reportedBy: 1 });
incidentSchema.index({ assignedTo: 1 });

module.exports = mongoose.model('Incident', incidentSchema);