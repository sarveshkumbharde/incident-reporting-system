import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";

const IncidentCard = ({ _id, title, image, reportedBy, assignedTo }) => {
  const { authRole, authUser } = useAuthStore();
  const navigate = useNavigate();

  // Authority guard: hide if not assigned to current authority
  const isAssignedToMe =
    authRole === "authority" && assignedTo?._id === authUser?._id;

  if (authRole === "authority" && !isAssignedToMe) {
    return null;
  }

  return (
    <div className="border rounded-lg p-4 shadow-md bg-white mb-4 flex items-center gap-4">
      {image && (
        <img
          src={image}
          alt="incident"
          className="h-24 w-24 object-cover rounded flex-shrink-0"
        />
      )}

      <div className="flex-1 min-w-0">
        <h2 className="font-bold text-xl truncate">{title}</h2>
        <p className="text-sm text-gray-600 mt-1">
          Reported by:{" "}
          <span className="font-semibold">
            {reportedBy?.firstName} {reportedBy?.lastName}
          </span>
        </p>
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
