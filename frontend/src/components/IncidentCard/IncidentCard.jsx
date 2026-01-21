import React, { useState } from "react";
import { useAuthStore } from "../../stores/authStore";
import toast from "react-hot-toast";

const IncidentCard = ({
  _id,
  title,
  description,
  image,
  status,
  reportedBy,
  assignedTo,
  refreshIncidents,
  feedback = [],
}) => {
  const {
    authUser,
    authRole,
    updateStatus,
    assignIncident,
    getAllAuthorities,
    addFeedback,
  } = useAuthStore();

  const [newStatus, setNewStatus] = useState(status);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [authorities, setAuthorities] = useState([]);
  const [selectedAuthority, setSelectedAuthority] = useState("");
  const [showAssignMenu, setShowAssignMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // Determine if this incident belongs to current authority
  const isAssignedToMe =
    authRole === "authority" && assignedTo?._id === authUser?._id;

  // Hide incident from authority if not assigned to them
  if (authRole === "authority" && !isAssignedToMe) {
    return null;
  }

  const handleStatusChange = async () => {
    setIsLoading(true);
    const success = await updateStatus(_id, newStatus);
    setIsLoading(false);
  };

  const handleAssign = async () => {
    if (!selectedAuthority) {
      toast.error("Please select an authority");
      return;
    }
    setIsLoading(true);
    const success = await assignIncident(_id, selectedAuthority);
    if (success) {
      setShowAssignMenu(false);
      refreshIncidents()
    }
    setIsLoading(false);
  };

  const handleAddFeedback = async () => {
    if (!feedbackMessage.trim()) {
      toast.error("Please enter your feedback");
      return;
    }

    setIsLoading(true);
    const success = await addFeedback(_id, feedbackMessage);

    if (success) {
      setFeedbackMessage("");
      setShowFeedback(false);
      refreshIncidents();
    }

    setIsLoading(false);
  };

  const openAssignMenu = async () => {
    setIsLoading(true);
    const auths = await getAllAuthorities();
    setAuthorities(auths);
    setShowAssignMenu(true);
    setIsLoading(false);
  };

  return (
    <div className="border rounded-lg p-4 shadow-md bg-white mb-4">
      <h2 className="font-bold text-xl">{title}</h2>
      <p className="text-gray-600">{description}</p>
      <img
        src={image}
        alt="incident"
        className="w-full h-64 object-contain my-2"
      />

      {/* Incident Info */}
      <div className="text-sm text-gray-500 mb-2">
        <p>
          Status: <span className="font-semibold">{status}</span>
        </p>
        <p>
          Reported by:{" "}
          <span className="font-semibold">
            {reportedBy?.firstName} {reportedBy?.lastName}
          </span>
        </p>
        {assignedTo && (
          <p>
            Assigned to:{" "}
            <span className="font-semibold">
              {assignedTo?.firstName} {assignedTo?.lastName}
            </span>
          </p>
        )}
        <p>
          Your role: <span className="font-semibold">{authRole}</span>
        </p>
      </div>

      {/* Status Control (Assigned Authority only) */}
      {authRole === "authority" && isAssignedToMe && (
        <div className="flex items-center gap-2 mt-2">
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="border p-1 rounded"
            disabled={isLoading}
          >
            <option value="reported">Reported</option>
            <option value="under review">Under Review</option>
            <option value="in progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="dismissed">Dismissed</option>
          </select>
          <button
            onClick={handleStatusChange}
            disabled={isLoading}
            className="bg-blue-500 text-white px-3 py-1 rounded disabled:bg-blue-300"
          >
            {isLoading ? "Updating..." : "Update Status"}
          </button>
        </div>
      )}

      {/* Assign (Admin only) */}
      {authRole === "admin" && !assignedTo && (
        <>
          <button
            onClick={openAssignMenu}
            disabled={isLoading}
            className="bg-yellow-500 text-white px-4 py-2 mt-3 rounded disabled:bg-yellow-300"
          >
            {isLoading ? "Loading..." : "Assign Incident"}
          </button>

          {showAssignMenu && (
            <div className="mt-2 border p-2 rounded bg-gray-50">
              <select
                onChange={(e) => setSelectedAuthority(e.target.value)}
                className="border p-1 rounded w-full"
                disabled={isLoading}
              >
                <option value="">Select Authority</option>
                {authorities.map((auth) => (
                  <option key={auth._id} value={auth._id}>
                    {auth.firstName} {auth.lastName}
                  </option>
                ))}
              </select>

              <button
                onClick={handleAssign}
                disabled={isLoading || !selectedAuthority}
                className="bg-green-600 text-white px-3 py-1 mt-2 rounded disabled:bg-green-300"
              >
                {isLoading ? "Assigning..." : "Assign"}
              </button>
            </div>
          )}
        </>
      )}

      {/* Feedback Section (User and Authority) */}
      <div className="mt-4 border-t pt-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold">Feedback & Messages</h3>
          <button
            onClick={() => setShowFeedback(!showFeedback)}
            className="bg-gray-500 text-white px-3 py-1 rounded text-sm"
          >
            {showFeedback ? "Cancel" : "Add Feedback"}
          </button>
        </div>

        {/* Add Feedback Form */}
        {showFeedback && (
          <div className="mt-2">
            <textarea
              placeholder="Enter your feedback or message..."
              value={feedbackMessage}
              onChange={(e) => setFeedbackMessage(e.target.value)}
              className="border p-2 rounded w-full"
              disabled={isLoading}
              rows="3"
            />
            <button
              onClick={handleAddFeedback}
              disabled={isLoading || !feedbackMessage.trim()}
              className="bg-purple-500 text-white px-4 py-2 mt-2 rounded disabled:bg-purple-300"
            >
              {isLoading ? "Submitting..." : "Submit Feedback"}
            </button>
          </div>
        )}

        {/* Display Existing Feedback */}
        <div className="mt-3 space-y-2 overflow-y-auto pr-2 max-h-40">
          {feedback && feedback.length > 0 ? (
            feedback.map((item, index) => (
              <div
                key={index}
                className={`border-l-4 pl-3 py-2 bg-gray-50 rounded ${
                  item.role === "user"
                    ? "border-green-500"
                    : item.role === "authority"
                    ? "border-blue-500"
                    : "border-yellow-500"
                }`}
              >
                <p className="text-sm text-gray-800">{item.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                      item.role === "user"
                        ? "bg-green-100 text-green-800"
                        : item.role === "authority"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {item.role === "user"
                      ? "👤 User"
                      : item.role === "authority"
                      ? "🛡️ Authority"
                      : "⚡ Admin"}
                  </span>
                  • {new Date(item.timestamp).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No feedback yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncidentCard;
