import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../stores/authStore";
import { Link } from "react-router-dom";

const AdminUsers = () => {
  const { getAllUsers, removeUser } = useAuthStore();
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    const data = await getAllUsers();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    const success = await removeUser(id);
    if (success) {
      fetchUsers(); // 🔥 Refresh only this list (no page reload)
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">All Users</h1>

      <table className="w-full border-collapse border bg-white shadow">
        <thead>
          <tr className="bg-gray-100 text-left">
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Role</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user._id} className="border">
              <td className="border px-4 py-2">
                {user.firstName} {user.lastName}
              </td>
              <td className="border px-4 py-2">{user.email}</td>
              <td className="border px-4 py-2 capitalize">{user.role}</td>

              <td className="border px-4 py-2 flex gap-2">
                <Link
                  to={`/view-user/${user._id}`}
                  className="bg-blue-500 text-white px-3 py-1 rounded"
                >
                  View Profile
                </Link>

                <button
                  onClick={() => handleDelete(user._id)}
                  className="bg-red-500 text-white px-3 py-1 rounded"
                >
                  Remove
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminUsers;
