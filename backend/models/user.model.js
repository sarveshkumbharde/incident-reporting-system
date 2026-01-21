const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    mobile: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    aadharCard: {
      type: String,
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "authority", "user"],
      default: "user",
    },
    profilePic: {
      type: String,
      default: null,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    reportedIncidents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Incident",
      },
    ],
    assignedIncidents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Incident",
      },
    ],
    notifications: [
      {
        text: {
          type: String,
          required: true,
        },
        incidentId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Incident",
        },
        type: {
          type: String,
          enum: ["info", "warning", "success", "error"],
          default: "info",
        },
        isRead: { type: Boolean, default: false },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    authProviders: {
      type: [String],
      enum: ["local", "google"],
      default: ["local"],
    },

    googleId: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
