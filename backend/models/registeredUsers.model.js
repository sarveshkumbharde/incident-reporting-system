const mongoose = require('mongoose');

const registeredUserSchema = new mongoose.Schema({
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
    aadharCard: {
        type: String,
        required: true,
        trim: true
    },
    profilePic: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
}, { 
    timestamps: true 
});

module.exports = mongoose.model('RegisteredUser', registeredUserSchema);