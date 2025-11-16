import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import toast from "react-hot-toast";

function ViewIncident() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    viewIncident,
    addFeedback,
    authRole,
    authUser,
    updateStatus,
    markComplete,
    assignIncident,
    getAllAuthorities,
  } = useAuthStore();

  const [incident, setIncident] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Admin/authority controls
  const [newStatus, setNewStatus] = useState("");
  const [assignList, setAssignList] = useState([]);
  const [selectedAuthority, setSelectedAuthority] = useState("");

  const feedbackListRef = useRef(null);

  // Load incident
  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setLoading(true);
      const data = await viewIncident(id);
      if (mounted && data) {
        setIncident(data);
        setNewStatus(data.status);
      }
      setLoading(false);
    };

    fetchData();

    return () => (mounted = false);
  }, [id, viewIncident]);

  // Scroll feedback to bottom automatically
  useEffect(() => {
    if (feedbackListRef.current) {
      setTimeout(() => {
        feedbackListRef.current.scrollTop =
          feedbackListRef.current.scrollHeight;
      }, 80);
    }
  }, [incident?.feedback?.length]);

  // -----------------------------
  // SUBMIT FEEDBACK
  // -----------------------------
  const handleSubmitFeedback = async () => {
    if (!feedbackMessage.trim()) {
      toast.error("Enter feedback");
      return;
    }

    setSubmitting(true);

    const res = await addFeedback(id, feedbackMessage);

    if (res?.success) {
      toast.success("Feedback submitted!");

      setIncident((prev) => ({
        ...prev,
        feedback: res.feedback,
      }));

      setFeedbackMessage("");
    }

    setSubmitting(false);
  };

  // -----------------------------
  // STATUS UPDATE (Admin + Authority)
  // -----------------------------
  const handleStatusUpdate = async () => {
    const success = await updateStatus(id, newStatus);
    if (success) {
      toast.success("Status updated!");
      setIncident((prev) => ({
        ...prev,
        status: newStatus,
      }));
    }
  };

  // -----------------------------
  // MARK COMPLETE (Authority)
  // -----------------------------
  const handleMarkComplete = async () => {
    const success = await markComplete(id);
    if (success) {
      toast.success("Incident marked complete!");
      setIncident((prev) => ({ ...prev, status: "resolved" }));
    }
  };

  // -----------------------------
  // ASSIGN TO AUTHORITY (Admin)
  // -----------------------------
  const loadAuthorities = async () => {
    const list = await getAllAuthorities();
    setAssignList(list || []);
  };

  const handleAssign = async () => {
    if (!selectedAuthority) {
      toast.error("Select an authority");
      return;
    }

    const success = await assignIncident(id, selectedAuthority);
    if (success) {
      toast.success("Incident assigned!");
      navigate(0);
    }
  };

  // ------------ UI RENDERING -------------
  const isAssignedToMe =
    authRole === "authority" &&
    incident?.assignedTo?._id === authUser?._id;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg" />
      </div>
    );
  }

  if (!incident) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-xl font-bold">Incident not found</h2>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <motion.div
      className="max-w-3xl mx-auto my-6 bg-white shadow-lg rounded-xl p-6"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="text-3xl font-bold mb-3">{incident.title}</h1>

      {incident.image && (
        <img
          src={incident.image}
          alt="Incident"
          className="w-full h-72 object-cover rounded-lg shadow mb-4"
        />
      )}

      {/* Details */}
      <div className="space-y-2 text-gray-700 mb-4">
        <p><strong>Description:</strong> {incident.description}</p>
        <p><strong>Location:</strong> {incident.location}</p>
        <p><strong>Severity:</strong> {incident.severity}</p>
        <p><strong>Status:</strong> {incident.status}</p>

        {incident.reportedBy && (
          <p>
            <strong>Reported By:</strong>{" "}
            {incident.reportedBy.firstName} {incident.reportedBy.lastName}
          </p>
        )}

        {incident.assignedTo && (
          <p>
            <strong>Assigned To:</strong>{" "}
            {incident.assignedTo.firstName} {incident.assignedTo.lastName}
          </p>
        )}
      </div>

      {/* ---------------- ADMIN FEATURES ---------------- */}
      {authRole === "admin" && (
        <div className="border-t pt-4 mt-4">
          <h2 className="text-lg font-semibold">Admin Controls</h2>

          {/* Status */}
          {/* <div className="mt-3 flex gap-3">
            <select
              className="select select-bordered"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="reported">Reported</option>
              <option value="under review">Under Review</option>
              <option value="in progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>

            <button
              className="btn btn-primary"
              onClick={handleStatusUpdate}
            >
              Update Status
            </button>
          </div> */}

          {/* Assign */}
          <div className="mt-4">
            <button
              onClick={loadAuthorities}
              className="btn btn-warning btn-sm"
            >
              Load Authorities
            </button>

            <select
              className="select select-bordered mt-2 w-full"
              onChange={(e) => setSelectedAuthority(e.target.value)}
            >
              <option value="">Select Authority</option>
              {assignList.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.firstName} {a.lastName}
                </option>
              ))}
            </select>

            <button
              className="btn btn-success w-full mt-2"
              onClick={handleAssign}
            >
              Assign Incident
            </button>
          </div>
        </div>
      )}

      {/* ---------------- AUTHORITY FEATURES ---------------- */}
      {authRole === "authority" && isAssignedToMe && (
        <div className="border-t pt-4 mt-4">
          <h2 className="text-lg font-semibold">Authority Controls</h2>

          {/* Status Update */}
          <div className="flex gap-3 mt-3">
            <select
              className="select select-bordered"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="reported">Reported</option>
              <option value="under review">Under Review</option>
              <option value="in progress">In Progress</option>
            </select>

            <button className="btn btn-blue" onClick={handleStatusUpdate}>
              Update Status
            </button>
          </div>

          {/* Mark Complete */}
          {/* <button
            className="btn btn-success mt-3"
            onClick={handleMarkComplete}
          >
            Mark Complete
          </button> */}
        </div>
      )}

      {/* ---------------- FEEDBACK SECTION ---------------- */}
      <div className="mt-6 border-t pt-4">
        <h2 className="text-xl font-semibold mb-2">Feedback</h2>

        <div
          ref={feedbackListRef}
          className="max-h-64 overflow-y-auto space-y-3 pr-2"
        >
          {incident.feedback?.length > 0 ? (
            incident.feedback.map((f, i) => (
              <div
                key={i}
                className="border rounded p-3 bg-gray-50 shadow-sm"
              >
                <p className="text-sm">{f.message}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {f.role} • {new Date(f.timestamp).toLocaleString()}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm">No feedback yet.</p>
          )}
        </div>

        {/* Add Feedback */}
        <textarea
          className="textarea textarea-bordered w-full mt-4"
          value={feedbackMessage}
          onChange={(e) => setFeedbackMessage(e.target.value)}
          rows="3"
        />

        <button
          className="btn btn-primary mt-2"
          onClick={handleSubmitFeedback}
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit Feedback"}
        </button>
      </div>

      <button
        onClick={() => navigate(-1)}
        className="mt-6 px-4 py-2 bg-gray-500 text-white rounded"
      >
        ← Go Back
      </button>
    </motion.div>
  );
}

export default ViewIncident;
