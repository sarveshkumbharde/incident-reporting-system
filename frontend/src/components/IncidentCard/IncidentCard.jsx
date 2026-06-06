import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

const IncidentCard = ({ _id, title, image, reportedBy, assignedTo, status, feedback }) => {
  const { authRole, authUser } = useAuthStore();
  const navigate = useNavigate();

  // Authority guard: hide if not assigned to current authority
  const isAssignedToMe =
    authRole === "authority" && assignedTo?._id === authUser?._id;

  if (authRole === "authority" && !isAssignedToMe) {
    return null;
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "reported":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "under review":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "in progress":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "resolved":
        return "bg-green-100 text-green-800 border-green-200";
      case "dismissed":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const feedbackCount = feedback?.length || 0;

  return (
    <div className="border rounded-lg p-4 shadow-md bg-white mb-4 flex items-center gap-4 hover:shadow-lg transition-shadow duration-200">
      {image && (
        <img
          src={image}
          alt="incident"
          className="h-24 w-24 object-cover rounded flex-shrink-0"
        />
      )}

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="font-bold text-xl truncate">{title}</h2>
          {status && (
            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${getStatusColor(status)}`}>
              {status}
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 mt-1">
          Reported by:{" "}
          <span className="font-semibold">
            {reportedBy?.firstName} {reportedBy?.lastName}
          </span>
        </p>
        
        {feedbackCount > 0 && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <span>💬</span>
            <span>{feedbackCount} feedback{feedbackCount > 1 ? "s" : ""}</span>
          </div>
        )}
      </div>

      <button
        onClick={() => navigate(`/view-incident/${_id}`)}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium flex-shrink-0"
      >
        View Incident
      </button>
    </div>
  );
};

export default IncidentCard;
