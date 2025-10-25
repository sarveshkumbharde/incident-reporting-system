import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../../stores/authStore";
import { useNavigate } from "react-router-dom";

function ViewIncident() {
  const { incident } = useAuthStore();
  const navigate = useNavigate();

  // Debug log to see what's in the incident state
  useEffect(() => {
    console.log("📊 Current incident data:", incident);
  }, [incident]);

  if (!incident || Object.keys(incident).length === 0) {
    return (
      <motion.div
        className="max-w-2xl mx-auto my-5 bg-white shadow-lg rounded-xl p-6 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl font-bold text-gray-800 mb-4">No Incident Selected</h2>
        <p className="text-gray-600 mb-4">Please select an incident to view details.</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Go Back
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="max-w-2xl mx-auto my-5 bg-white shadow-lg rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      <motion.h2
        className="text-2xl font-bold text-gray-800 mb-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {incident.title}
      </motion.h2>
      
      <motion.p
        className="text-gray-600 mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {incident.description}
      </motion.p>

      {incident.image && (
        <motion.img
          src={incident.image}
          alt="Incident"
          className="w-full h-64 object-cover rounded-lg mb-4 shadow-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        />
      )}

      <div className="space-y-3">
        <motion.p className="text-sm text-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}>
          <strong>📍 Location:</strong> {incident.location}
        </motion.p>
        
        <motion.p className="text-sm text-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.5 }}>
          <strong>🔥 Severity:</strong>
          <span className={`ml-2 px-3 py-1 rounded-full text-white ${getSeverityColor(incident.severity)}`}>
            {incident.severity?.toUpperCase() || "UNKNOWN"}
          </span>
        </motion.p>

        <motion.p className="text-sm text-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}>
          <strong>🔄 Status:</strong> 
          <span className={`ml-2 px-3 py-1 rounded-full ${getStatusColor(incident.status)}`}>
            {incident.status?.toUpperCase() || "UNKNOWN"}
          </span>
        </motion.p>

        {/* Show assigned authority if exists */}
        {incident.assignedTo && (
          <motion.p className="text-sm text-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.7 }}>
            <strong>👮 Assigned To:</strong> {incident.assignedTo.firstName} {incident.assignedTo.lastName}
          </motion.p>
        )}

        {/* Show reported by info */}
        {incident.reportedBy && (
          <motion.p className="text-sm text-gray-700"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}>
            <strong>📝 Reported By:</strong> {incident.reportedBy.firstName} {incident.reportedBy.lastName}
          </motion.p>
        )}
      </div>

      {/* Back button */}
      <motion.button
        onClick={() => navigate(-1)}
        className="mt-6 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.9 }}
      >
        ← Go Back
      </motion.button>
    </motion.div>
  );
}

function getSeverityColor(severity) {
  switch (severity) {
    case "low": return "bg-green-500";
    case "medium": return "bg-yellow-500";
    case "high": return "bg-orange-500";
    case "critical": return "bg-red-500";
    default: return "bg-gray-500";
  }
}

function getStatusColor(status) {
  switch (status) {
    case "reported": return "bg-blue-100 text-blue-800";
    case "under review": return "bg-yellow-100 text-yellow-800";
    case "in progress": return "bg-orange-100 text-orange-800";
    case "resolved": return "bg-green-100 text-green-800";
    case "dismissed": return "bg-red-100 text-red-800";
    default: return "bg-gray-100 text-gray-800";
  }
}

export default ViewIncident;