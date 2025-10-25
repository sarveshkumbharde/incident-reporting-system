import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "../../stores/authStore";
import { useNavigate } from "react-router-dom";

function GetMessages() {
  const { authUser, getMessages, viewIncident } = useAuthStore();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMessages();
  }, []);

  const loadMessages = async () => {
    setLoading(true);
    const messagesData = await getMessages();
    setMessages(messagesData);
    setLoading(false);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleString();
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'authority': return 'bg-blue-100 text-blue-800';
      case 'user': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleViewIncident = async (incidentId) => {
  try {
    console.log("🔍 Viewing incident:", incidentId);
    
    // Wait for the incident to be fetched and stored
    const incident = await viewIncident(incidentId);
    
    if (incident) {
      // Navigate after successful fetch
      navigate('/view-incident');
    } else {
      alert("Failed to load incident details");
    }
  } catch (error) {
    console.error("❌ Error viewing incident:", error);
    alert("Error loading incident details");
  }
};

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded mb-4"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-2xl font-bold text-primary">Messages</h1>
          <p className="text-gray-600">
            {messages.length} message{messages.length !== 1 ? 's' : ''} from authorities
          </p>
        </div>
        <button
          onClick={loadMessages}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Refresh
        </button>
      </motion.div>

      {/* Messages List */}
      {messages.length === 0 ? (
        <motion.div
          className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <h3 className="text-lg font-semibold text-gray-700">No Messages</h3>
          <p className="text-gray-500 mt-2">
            You don't have any messages from authorities yet.
          </p>
        </motion.div>
      ) : (
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.1 }}
        >
          {messages.map((message, index) => (
            <motion.div
              key={message._id || index}
              className="bg-white border rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              {/* Message Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {message.sentBy?.firstName?.charAt(0)}{message.sentBy?.lastName?.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-semibold text-gray-900">
                        {message.sentBy?.firstName} {message.sentBy?.lastName}
                      </h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(message.sentBy?.role)}`}>
                        {message.sentBy?.role}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500">
                      Re: {message.incidentTitle}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {formatTime(message.sentAt)}
                </span>
              </div>

              {/* Message Content */}
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <p className="text-gray-800 whitespace-pre-wrap">{message.text}</p>
              </div>

              {/* Incident Info */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <div className="flex items-center space-x-4">
                  <span className={`px-2 py-1 rounded ${
                    message.incidentStatus === 'resolved' ? 'bg-green-100 text-green-800' :
                    message.incidentStatus === 'in progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {message.incidentStatus}
                  </span>
                  <span>Incident ID: {message.incidentId?.toString().slice(-8)}</span>
                </div>
                <button
                  onClick={() => handleViewIncident(message.incidentId)}
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                >
                  View Incident →
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default GetMessages;