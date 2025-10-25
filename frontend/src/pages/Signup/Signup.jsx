import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../../stores/authStore";
import { User, CreditCard, Camera, Upload } from "lucide-react";

const Signup = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    address: "",
    password: "",
  });
  const [aadharFile, setAadharFile] = useState(null);
  const [profilePic, setProfilePic] = useState(null);
  const [aadharFileName, setAadharFileName] = useState("");
  const [profilePicName, setProfilePicName] = useState("");

  const { register } = useAuthStore();

  const handleAadharFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAadharFile(file);
      setAadharFileName(file.name);
    }
  };

  const handleProfilePic = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setProfilePicName(file.name);
    }
  };

  const validateFormData = () => {
    if (!formData.firstName.trim()) return toast.error("First name is required!");
    if (!formData.lastName.trim()) return toast.error("Last name is required!");
    if (!formData.email.trim()) return toast.error("Email is required!");
    if (!/\S+@\S+\.\S+/.test(formData.email)) return toast.error("Invalid email format");
    if (!formData.mobile.trim()) return toast.error("Mobile number is required!");
    if (!aadharFile) return toast.error("Aadhar card is required!");
    if (!formData.address.trim()) return toast.error("Address is required!");
    if (!formData.password) return toast.error("Password is required!");
    if (formData.password.length < 6)
      return toast.error("Password must be at least 6 characters long!");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateFormData()) {
      const data = new FormData();
      data.append("firstName", formData.firstName);
      data.append("lastName", formData.lastName);
      data.append("email", formData.email);
      data.append("mobile", formData.mobile);
      data.append("address", formData.address);
      data.append("password", formData.password);
      data.append("aadharCard", aadharFile);
      if (profilePic) {
        data.append("profilePic", profilePic);
      }

      register(data);
    }
  };

  const clearAadharFile = () => {
    setAadharFile(null);
    setAadharFileName("");
  };

  const clearProfilePic = () => {
    setProfilePic(null);
    setProfilePicName("");
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row items-center justify-center bg-gray-200 py-8">
      <div className="lg:w-1/2 bg-white p-8 lg:p-12 shadow-lg rounded-lg max-w-lg mx-4">
        <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Create Account</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text font-medium">First Name</span>
              </label>
              <input
                type="text"
                name="firstName"
                placeholder="Enter your first name"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="input input-bordered w-full"
                required
              />
            </div>
            <div>
              <label className="label">
                <span className="label-text font-medium">Last Name</span>
              </label>
              <input
                type="text"
                name="lastName"
                placeholder="Enter your last name"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="input input-bordered w-full"
                required
              />
            </div>
          </div>

          <div>
            <label className="label">
              <span className="label-text font-medium">Email Address</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="input input-bordered w-full"
              required
            />
          </div>

          <div>
            <label className="label">
              <span className="label-text font-medium">Mobile Number</span>
            </label>
            <input
              type="text"
              name="mobile"
              placeholder="Enter your mobile number"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              className="input input-bordered w-full"
              required
            />
          </div>

          {/* File Uploads */}
          <div className="space-y-4">
            {/* Aadhar Card Upload - Required */}
            <div className="border-2 border-dashed border-blue-300 rounded-lg p-4 bg-blue-50">
              <label className="block mb-2">
                <span className="label-text font-medium flex items-center text-blue-700">
                  <CreditCard className="w-4 h-4 mr-2" />
                  Aadhar Card Upload (Required)
                </span>
                <span className="label-text-alt text-blue-600">
                  Upload a clear image of your Aadhar card for verification
                </span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  name="aadharCard"
                  accept=".jpg,.jpeg,.png,.pdf"
                  onChange={handleAadharFile}
                  className="file-input file-input-bordered file-input-primary w-full"
                  required
                />
                {aadharFileName && (
                  <button
                    type="button"
                    onClick={clearAadharFile}
                    className="btn btn-sm btn-ghost text-error"
                  >
                    ✕
                  </button>
                )}
              </div>
              {aadharFileName && (
                <p className="text-sm text-green-600 mt-2 flex items-center">
                  <Upload className="w-4 h-4 mr-1" />
                  Selected: {aadharFileName}
                </p>
              )}
            </div>

            {/* Profile Picture Upload - Optional */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 bg-gray-50">
              <label className="block mb-2">
                <span className="label-text font-medium flex items-center text-gray-700">
                  <Camera className="w-4 h-4 mr-2" />
                  Profile Picture (Optional)
                </span>
                <span className="label-text-alt text-gray-600">
                  Upload a profile picture to personalize your account
                </span>
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  name="profilePic"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleProfilePic}
                  className="file-input file-input-bordered w-full"
                />
                {profilePicName && (
                  <button
                    type="button"
                    onClick={clearProfilePic}
                    className="btn btn-sm btn-ghost text-error"
                  >
                    ✕
                  </button>
                )}
              </div>
              {profilePicName && (
                <p className="text-sm text-green-600 mt-2 flex items-center">
                  <Upload className="w-4 h-4 mr-1" />
                  Selected: {profilePicName}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="label">
              <span className="label-text font-medium">Address</span>
            </label>
            <textarea
              name="address"
              placeholder="Enter your complete address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="textarea textarea-bordered w-full h-24"
              required
            ></textarea>
          </div>

          <div>
            <label className="label">
              <span className="label-text font-medium">Password</span>
            </label>
            <input
              type="password"
              name="password"
              placeholder="Create a strong password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="input input-bordered w-full"
              required
            />
            <label className="label">
              <span className="label-text-alt text-gray-500">
                Password must be at least 6 characters long
              </span>
            </label>
          </div>

          <button type="submit" className="btn btn-primary w-full py-3 text-lg">
            Create Account
          </button>
        </form>

        <div className="mt-6 text-center space-y-2">
          <p className="text-gray-600">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-500 hover:underline font-medium">
              Login here
            </Link>
          </p>
          <p className="text-gray-600">
            Waiting for approval?{" "}
            <Link to="/check-approval" className="text-blue-500 hover:underline font-medium">
              Check your approval status
            </Link>
          </p>
        </div>
      </div>

      {/* Right Side - Welcome Section */}
      <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-12 lg:w-1/2 min-h-screen">
        <div className="max-w-md text-center text-white">
          <div className="mb-8">
            <User className="w-20 h-20 mx-auto mb-4 opacity-90" />
            <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
            <p className="text-lg opacity-90">
              Create your account to start reporting incidents and help make your community safer.
            </p>
          </div>
          <div className="space-y-4 text-left">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <CreditCard className="w-4 h-4" />
              </div>
              <span>Aadhar verification for secure access</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Camera className="w-4 h-4" />
              </div>
              <span>Personalize with profile picture</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <span>Quick approval process</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;