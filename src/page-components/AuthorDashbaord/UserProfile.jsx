"use client";

import React, { useState } from "react";
import { useStore } from "../../store/useStore";
import { User2, RefreshCcw, CheckCircle, Mail, Shield, Calendar, LogOut } from "lucide-react";
import Image from "next/image";
import { authAPI } from "../../lib/api/auth"; // Path check kar lijiye ga

const UserProfile = () => {
  const { user, setUser, logout } = useStore();

  // --- States for Modals ---
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // --- States for Form Inputs ---
  const [newUsername, setNewUsername] = useState(user?.username || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);

  if (!user) {
    return <p className="text-center text-white py-10">Loading profile...</p>;
  }

  // --- Handlers ---
  const handleProfileUpdate = async () => {
    try {
      await authAPI.updateProfile(user.id, { username: newUsername });
      alert("Username updated successfully!");
      setShowEditModal(false);
      window.location.reload();
    } catch (error) {
      alert("Error updating username");
    }
  };

  

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) return alert("Passwords do not match!");
    try {
      await authAPI.updateProfile(user.id, { oldPassword, password: newPassword });
      alert("Password updated successfully!");
      setShowPasswordModal(false);
      setOldPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (error) {
      alert("Error updating password");
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const updatedUser = await authAPI.updateAvatar(user.id, file);
      setUser(updatedUser);
      alert("Avatar updated successfully!");
      setShowAvatarModal(false);
      window.location.reload();
    } catch (error) {
      alert("Error updating avatar");
    }
  };

  // Helper formatting
  const displayName = user.fullName || user.username;
  const avatarUrl = user.avatar?.url 
    ? (user.avatar.url.startsWith('http') ? user.avatar.url : `${process.env.NEXT_PUBLIC_API_URL}${user.avatar.url}`)
    : null;

  const getInitials = () => (user.fullName || user.username)?.charAt(0).toUpperCase() || 'U';



  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-xl shadow-lg border border-gray-700">
        <div className="flex items-center space-x-4">
          <div 
            className="relative group cursor-pointer"
            onClick={() => setShowAvatarModal(true)}
          >
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md overflow-hidden border-2 border-white/20 group-hover:border-blue-400 transition-all">
              {avatarUrl ? (
                <Image src={avatarUrl} alt={displayName} width={96} height={96} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl font-bold text-white">{getInitials()}</span>
              )}
            </div>
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="text-white text-xs">Change</span>
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-2xl font-bold text-white">{displayName}</h3>
            <p className="text-gray-300 text-sm flex items-center gap-2"><Mail size={14}/> {user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full uppercase font-bold tracking-wider">
                {user.role?.name || "User"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
        <h4 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
          <User2 size={20} className="text-blue-400"/> Profile Details
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailRow label="Username" value={user.username} />
          <DetailRow label="Joined" value={new Date(user.createdAt).toLocaleDateString()} />
        </div>
      </div>

      {/* Actions */}
      <div className="bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-700">
        <h4 className="text-lg font-semibold mb-4 text-white">Account Settings</h4>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setShowEditModal(true)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all text-sm">
            Update Username
          </button>
          <button onClick={() => setShowPasswordModal(true)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all text-sm">
            Change Password
          </button>
        </div>
      </div>

      {/* --- MODALS --- */}
      {showEditModal && (
        <Modal title="Edit Username" onClose={() => setShowEditModal(false)}>
          <input 
            type="text" 
            className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white mb-4"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />
          <button onClick={handleProfileUpdate} className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold">Save Changes</button>
        </Modal>
      )}

      {showPasswordModal && (
        <Modal title="Change Password" onClose={() => setShowPasswordModal(false)}>
          <div className="space-y-3">
            <input type="password" placeholder="Current Password" title="Old" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white" onChange={(e) => setOldPassword(e.target.value)} />
            <input type="password" placeholder="New Password" title="New" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white" onChange={(e) => setNewPassword(e.target.value)} />
            <input type="password" placeholder="Confirm New Password" title="Confirm" className="w-full bg-gray-900 border border-gray-700 rounded-lg p-2.5 text-white" onChange={(e) => setConfirmPassword(e.target.value)} />
            <button onClick={handlePasswordUpdate} className="w-full py-2 bg-green-600 text-white rounded-lg font-bold mt-2">Update Password</button>
          </div>
        </Modal>
      )}

      {showAvatarModal && (
        <Modal title="Update Avatar" onClose={() => setShowAvatarModal(false)}>
          <p className="text-gray-400 text-sm mb-4">Choose a new profile picture</p>
          <input type="file" accept="image/*" onChange={handleAvatarUpload} className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer" />
        </Modal>
      )}
    </div>
  );
};

// --- Helper Components ---
const DetailRow = ({ label, value }) => (
  <div className="flex justify-between py-2 border-b border-gray-700/50">
    <span className="text-gray-400 text-sm">{label}</span>
    <span className="text-white font-medium">{value}</span>
  </div>
);

const Modal = ({ title, children, onClose }) => (
  <div className="fixed inset-0 bg-black/80 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
    <div className="bg-gray-800 p-6 rounded-2xl w-full max-w-md relative border border-gray-700 shadow-2xl">
      <h2 className="text-xl font-bold mb-4 text-white">{title}</h2>
      {children}
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white text-xl">✕</button>
    </div>
  </div>
);

export default UserProfile;