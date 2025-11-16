import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import toast from 'react-hot-toast';

const RegistrationCard = () => {
  const { registrations, viewRegistrations, isAccepting, acceptUser } = useAuthStore();
  const [loadingUsers, setLoadingUsers] = useState({});

  useEffect(() => {
    const fetchRegistrations = async () => {
      try {
        await viewRegistrations();
      } catch (error) {
        toast.error("Failed to fetch registrations."); 
      }
    };

    fetchRegistrations();
  }, [viewRegistrations]);

  const handleUserAction = async (id, approval) => {
    setLoadingUsers((prev) => ({ ...prev, [id]: true }));
    try {
      const success = await acceptUser({ userId: id, approval });
      if (!success) {
        toast.error(`Failed to ${approval ? "accept" : "reject"} user.`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${approval ? "accept" : "reject"} user.`);
    } finally {
      setLoadingUsers((prev) => ({ ...prev, [id]: false }));
      window.location.reload();
    }
  };

  // Filter only pending registrations
  const pendingRegistrations = registrations.filter(user => user.status === 'pending');

  if (isAccepting) return <div className="text-center mt-10">Processing...</div>;

  return (
    <div className="flex flex-col items-center">
      {pendingRegistrations.length === 0 ? (
        <div className="text-center mt-10">No pending registrations found.</div>
      ) : (
        pendingRegistrations.map((user) => (
          <div key={user._id} className="bg-white p-4 shadow-lg rounded-lg mb-4 w-full max-w-md">
            <img
              src={user.profilePic}
              alt={`${user.firstName} ${user.lastName}`}
              className="rounded-full h-24 w-24 mx-auto object-cover"
            />
            <h2 className="text-xl font-semibold text-center mt-2">{`${user.firstName} ${user.lastName}`}</h2>
            <p className="text-center text-gray-600">{user.email}</p>
            <p className="text-center text-gray-600">{user.mobile}</p>
            <p className="text-center text-gray-600">{user.address}</p>
            <p className="text-center text-yellow-500 font-medium">
              Status: {user.status}
            </p>
            <p className="text-gray-500 text-sm text-center">
              Registered on: {new Date(user.createdAt).toLocaleDateString()}
            </p>
            <div className="mt-4">
              <h3 className="text-lg font-medium text-center">Aadhar Card:</h3>
              <img 
                src={user.aadharCard} 
                alt="Aadhar Card" 
                className="mt-2 rounded-lg h-40 w-80 object-contain mx-auto border"
              />
            </div>
            <div className="flex justify-center mt-4 space-x-2">
              <button
                onClick={() => handleUserAction(user._id, true)}
                disabled={loadingUsers[user._id]}
                className={`${
                  loadingUsers[user._id] ? 'bg-gray-400' : 'bg-green-500 hover:bg-green-600'
                } text-white font-semibold py-2 px-4 rounded transition duration-200`}
              >
                {loadingUsers[user._id] ? "Processing..." : "Accept"}
              </button>
              <button
                onClick={() => handleUserAction(user._id, false)}
                disabled={loadingUsers[user._id]}
                className={`${
                  loadingUsers[user._id] ? 'bg-gray-400' : 'bg-red-500 hover:bg-red-600'
                } text-white font-semibold py-2 px-4 rounded transition duration-200`}
              >
                {loadingUsers[user._id] ? "Processing..." : "Reject"}
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default RegistrationCard;