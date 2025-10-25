import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { motion } from 'framer-motion';
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  FileText
} from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const UserDashboard = () => {
  const { authUser, authRole, getUserIncidents } = useAuthStore();
  const [userIncidents, setUserIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authRole === 'user') {
      fetchUserData();
    }
  }, [authRole]);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const incidents = await getUserIncidents();
      setUserIncidents(incidents);
    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authRole !== 'user') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access the user dashboard.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  const stats = {
    totalIncidents: userIncidents.length,
    resolvedIncidents: userIncidents.filter(i => i.status === 'resolved').length,
    inProgressIncidents: userIncidents.filter(i => i.status === 'under review').length,
    openIncidents: userIncidents.filter(i => i.status === 'reported').length
  };

  const pieData = {
    labels: ['Resolved', 'In Progress', 'Open'],
    datasets: [{
      data: [
        stats.resolvedIncidents,
        stats.inProgressIncidents,
        stats.openIncidents
      ],
      backgroundColor: ['#10B981', '#F59E0B', '#EF4444'],
      hoverBackgroundColor: ['#059669', '#D97706', '#DC2626'],
    }],
  };

  const barData = {
    labels: ['Total', 'Resolved', 'In Progress', 'Open'],
    datasets: [{
      label: 'Count',
      data: [
        stats.totalIncidents,
        stats.resolvedIncidents,
        stats.inProgressIncidents,
        stats.openIncidents
      ],
      backgroundColor: ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'],
    }],
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">User Dashboard</h1>
          <p className="text-gray-600">Welcome back, {authUser?.firstName}!</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                <FileText className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Incidents</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalIncidents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 text-green-600">
                <CheckCircle className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.resolvedIncidents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
                <Clock className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgressIncidents}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100 text-red-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Open</p>
                <p className="text-2xl font-bold text-gray-900">{stats.openIncidents}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <div
                className="py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 border-blue-500 text-blue-600"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Overview</span>
              </div>
            </nav>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">Incident Status Distribution</h3>
                  <div className="bg-white p-4 rounded-lg">
                    <Pie data={pieData} />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-4">Incident Statistics</h3>
                  <div className="bg-white p-4 rounded-lg">
                    <Bar data={barData} />
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;