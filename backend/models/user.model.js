const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    }, 
    mobile: {
        type: String, 
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    aadharCard: {
        type: String,
        trim: true
    },
    role: {
        type: String,
        enum: ['admin', 'authority', 'user'], 
        default: "user"
    },
    profilePic: {
        type: String,
        default: null
    },
    // Track incidents reported by this user
    reportedIncidents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Incident'
    }],
    // Track incidents assigned to this user (for authorities)
    assignedIncidents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Incident'
    }],
    notifications: [{
        text: {
            type: String,
            required: true
        }, 
        incidentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Incident'
        },
        type: {
            type: String,
            enum: ['info', 'warning', 'success', 'error'],
            default: 'info'
        },
        isRead: { type: Boolean, default: false },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { 
    timestamps: true // Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('User', userSchema);