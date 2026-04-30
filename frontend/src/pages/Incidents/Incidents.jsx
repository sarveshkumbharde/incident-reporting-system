import React, { useEffect } from "react";
import IncidentCard from "../../components/IncidentCard/IncidentCard";
import { useAuthStore } from "../../stores/authStore";

const Incident = () => {
  const { viewIncidents, incidents, authUser, authRole } = useAuthStore();

  useEffect(() => {
    viewIncidents();
  }, [viewIncidents]);

  const refreshIncidents = async () => {
    await viewIncidents();
  };

  console.log("🔍 Incident Component - authRole:", authRole);
  console.log("🔍 Incident Component - incidents:", incidents);

  // Show loading state
  if (incidents === null) {
    return (
      <div className="text-lg text-center text-gray-700 mt-8">
        Loading incidents...
      </div>
    );
  }

  // Filter incidents for authority to avoid empty card wrappers
  const filteredIncidents =
    authRole === "authority"
      ? incidents.filter((inc) => inc.assignedTo?._id === authUser?._id)
      : incidents;

  // For authorities, show message if no assigned incidents
  if (authRole === "authority" && filteredIncidents.length === 0) {
    return (
      <div className="text-lg text-center text-gray-700 mt-8">
        No incidents assigned to you yet!
      </div>
    );
  }

  // For users, show message if no incidents reported
  if (authRole === "user" && filteredIncidents.length === 0) {
    return (
      <div className="text-lg text-center text-gray-700 mt-8">
        You haven't reported any incidents yet!
      </div>
    );
  }

  // For admin, show message if no incidents at all
  if (authRole === "admin" && filteredIncidents.length === 0) {
    return (
      <div className="text-lg text-center text-gray-700 mt-8">
        No incidents reported in the system yet!
      </div>
    );
  }

  if (!filteredIncidents || filteredIncidents.length === 0) {
    return <div className="text-lg text-red-700">No incidents found!</div>;
  }

  return (
    <div className="p-4 bg-gray-200 min-h-screen">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">
          {authRole === "admin" && "All Incidents"}
          {authRole === "authority" && "Incidents Assigned to You"}
          {authRole === "user" && "Your Reported Incidents"}
        </h1>
        <p className="text-gray-600">
          Showing {filteredIncidents.length} incident(s)
        </p>
      </div>

      {filteredIncidents.map((incident, index) => (
        <div key={incident._id || index} className="mb-4">
          <IncidentCard {...incident} refreshIncidents={refreshIncidents} />
        </div>
      ))}
    </div>
  );
};

export default Incident;
