"use client";
import { useRouter } from "next/navigation";
import { useStore } from "../store/useStore";
import { User2, Mail, Calendar, Shield, LogOut, Settings, Users, CheckCircle, RefreshCcw } from "lucide-react";
import { useEffect, useState } from "react";
import Image from "next/image";

import { authAPI } from "../lib/api";

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, setUser ,authLoaded } = useStore();
  const [dbRequestStatus, setDbRequestStatus] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [loading, setLoading] = useState(false); // 2. Add this line

  const [newUsername, setNewUsername] = useState(user?.username || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarFile, setAvatarFile] = useState(null);

  // --- States for Author Request ---
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);


  // ... existing states

useEffect(() => {
  if (authLoaded && !user) {
    router.push("/login");
  }

  // ✨ Load existing request status from DB
  const fetchStatus = async () => {
    if (user?.id) {
      try {
        const response = await authAPI.checkMyRequest(user.id);
        if (response.data && response.data.length > 0) {
          // Strapi returns data in attributes
          const status = response.data[0].attributes?.request_status;
          setDbRequestStatus(status);
          setRequestSent(true); // Isse button disable ho jayega
        }
      } catch (err) {
        console.error("Error fetching status:", err);
      }
    }
  };

  fetchStatus();
}, [user, authLoaded]);
  

  useEffect(() => {
    // Sirf tab redirect karein jab auth checking poori ho chuki ho (authLoaded: true)
    // aur phir bhi user na mile
    if (authLoaded && !user) {
      router.push("/login");
    }
  }, [user, authLoaded, router]);

  // 1. Jab tak storage se data load ho raha hai, ye screen dikhegi
  if (!authLoaded) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f1b2d] text-white">
        <RefreshCcw className="animate-spin text-blue-500 w-10 h-10 mb-4" />
        <p className="text-gray-400 animate-pulse font-bold">Verifying Session...</p>
      </div>
    );
  }

  if (!user) return null;

  // --- Handler: Request Author Access ---
  const handleBecomeAuthor = async () => {
    setIsRequesting(true);
    try {
      await authAPI.requestAuthorRole({
        id: user.id,
        username: user.username,
        email: user.email,
      });
      setRequestSent(true);
      alert("Application submitted successfully! Our team will review your request shortly.");
    } catch (error) {
      console.error("Request Error:", error);
      alert("Failed to submit request. Please try again later.");
    } finally {
      setIsRequesting(false);
    }
  };

const handleSyncStatus = async () => {
  setLoading(true); // Ensure you have a loading state
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found. Please log in again.");

    // Using the direct API URL to avoid 404/401 issues
    const baseUrl = "https://admin.entertainindia.com/api";

    // 1. ✨ THE SCAN: Fetching fresh data with Role and Avatar
    const res = await fetch(`${baseUrl}/users/me?populate[role]=true&populate[avatar][populate]=*`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!res.ok) {
      if (res.status === 401) throw new Error("Session expired. Please log in again.");
      throw new Error("Sync failed. Server responded with an error.");
    }

    const updatedUser = await res.json();

    // 2. ✨ UPDATE LOCAL STORAGE & STORE
    // This ensures that even if the user refreshes, the "Author" role persists
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser); 

    // 3. ✨ FEEDBACK
    if (updatedUser.role?.name === "Author") {
      alert("Success! Your profile is synced and you are now an Author. 🥳");
    } else {
      alert(`Profile synced. Current Role: ${updatedUser.role?.name || "User"}`);
    }

  } catch (err) {
    console.error("Sync Error:", err);
    alert(err.message || "Sync failed. Please try again later.");
  } finally {
    setLoading(false);
  }
};



  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const handleProfileUpdate = async () => {
    try {
      await authAPI.updateProfile(user.id, { username: newUsername });
      alert("Username updated successfully!");
      setShowEditModal(false);
      if (typeof window !== "undefined") window.location.reload();
    } catch (error) {
      alert("Error updating username");
    }
  };

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      alert("New passwords do not match!");
      return;
    }
    try {
      await authAPI.updateProfile(user.id, { oldPassword, password: newPassword });
      alert("Password updated successfully!");
      setShowPasswordModal(false);
      setOldPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch (error) {
      alert("Error updating password");
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return alert("Please select an image");
    try {
      const updatedUser = await authAPI.updateAvatar(user.id, avatarFile);
      setUser(updatedUser);
      alert("Avatar updated successfully!");
      setShowAvatarModal(false);
      if (typeof window !== "undefined") window.location.reload();
    } catch (error) {
      alert("Error updating avatar");
    }
  };

   const avatarUrl = user.avatar?.url 
    ? (user.avatar.url.startsWith('http') ? user.avatar.url : `${process.env.NEXT_PUBLIC_API_URL}${user.avatar.url}`)
    : null;

  return (
    <>
      <title>Profile - EntertainIndia</title>

      <div className="max-w-7xl mx-auto px-4 py-6 bg-[#f6f6f6]  rounded-2xl dark:bg-gray-800">
        <div >
{/* PROFILE HEADER */}
<div className="card p-4 sm:p-8 mb-10 bg-white dark:bg-[#0f1b2d] shadow-lg rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">

  <div className="p-4 sm:p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
    
    {/* Top Profile Section */}
    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">

      {/* Avatar */}
      <div
        className="relative group cursor-pointer flex-shrink-0"
        onClick={() => setShowAvatarModal(true)}
      >
        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-md overflow-hidden border-2 border-white/20 group-hover:border-blue-400 transition-all">
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt="User Avatar"
              width={96}
              height={96}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-3xl font-bold text-white">
              {user.username?.charAt(0).toUpperCase()}
            </span>
          )}
        </div>

        <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="text-white text-xs">Change</span>
        </div>
      </div>

      {/* User Info */}
      <div className="flex-1 w-full text-center sm:text-left">

        <h1 className="text-xl sm:text-2xl font-bold break-words">
          {user.username}
        </h1>

        <p className="text-sm flex flex-wrap justify-center sm:justify-start items-center gap-2 mt-1 break-all">
          <Mail size={14} />
          <span className="break-all">{user.email}</span>
        </p>

        <div className="flex justify-center sm:justify-start items-center gap-2 mt-3">
          <span className="px-3 py-1 bg-blue-600 text-white text-xs rounded-full uppercase font-bold tracking-wider">
            {user.role?.name || "User"}
          </span>
        </div>
      </div>
    </div>
  </div>

  {/* Details Grid */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-200 dark:border-gray-700 break-words">

    <DetailItem label="Username" value={user.username} icon={<User2 />} />
    <DetailItem label="Email" value={user.email} icon={<Mail />} />
    <DetailItem
      label="Account Created"
      value={new Date(user.createdAt).toLocaleDateString()}
      icon={<Calendar />}
    />
    <DetailItem
      label="Role"
      value={user.role?.name || "User"}
      icon={<Shield />}
    />
  </div>

  {/* Action Buttons */}
  <div className="flex flex-col sm:flex-row gap-4 mt-6">

    <button
      onClick={() => setShowEditModal(true)}
      className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
    >
      Edit Username
    </button>

    <button
      onClick={() => setShowPasswordModal(true)}
      className="w-full sm:w-auto px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all"
    >
      Change Password
    </button>

  </div>

  {/* --- BECOME AN AUTHOR SECTION --- */}
  {user.role?.name !== "Author" && (
    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">

      <div className="p-4 sm:p-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50">

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-4">
          <div className="p-3 bg-blue-600 rounded-lg shadow-lg">
            <Users className="text-white w-6 h-6" />
          </div>

          <div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">
              Become an Author
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm break-words">
              Apply now to start writing and contributing articles.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-4">

          <div className="flex flex-col sm:flex-row gap-4">

            <button
              onClick={handleBecomeAuthor}
              disabled={isRequesting || requestSent || dbRequestStatus === "pending"}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all shadow-md ${
                (requestSent || dbRequestStatus === "pending")
                  ? "bg-amber-100 text-amber-700 cursor-not-allowed border border-amber-200"
                  : "bg-blue-600 text-white hover:bg-blue-700 active:scale-95"
              }`}
            >
              {isRequesting ? (
                <>
                  <RefreshCcw className="animate-spin" size={18} />
                  Sending...
                </>
              ) : (dbRequestStatus === "pending" || requestSent) ? (
                <>
                  <CheckCircle size={18} />
                  Request Pending
                </>
              ) : dbRequestStatus === "published" || dbRequestStatus === "approved" ? (
                <>
                  <CheckCircle size={18} />
                  Approved
                </>
              ) : (
                "Apply for Author Access"
              )}
            </button>

            {(requestSent || dbRequestStatus === "pending") && (
              <button
                onClick={handleSyncStatus}
                className="w-full sm:w-auto flex items-center justify-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-800 dark:text-blue-400 underline underline-offset-4"
              >
                <RefreshCcw className="w-4 h-4" />
                Sync Status
              </button>
            )}

          </div>

          {/* Professional Message */}
          {(requestSent || dbRequestStatus === "pending") && (
            <div className="p-3 bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100/50 dark:border-blue-800/30 rounded-lg">
              <p className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2 break-words">
                <span className="relative flex h-2 w-2 mt-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                Your request has been successfully sent. Author permissions will be granted shortly after a quick review by our team.
              </p>
            </div>
          )}

        </div>
      </div>
    </div>
  )}

</div>

          {/* LOGOUT */}
          <div className="p-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <h2 className="text-xl font-heading font-bold mb-2 text-red-700 dark:text-red-400 font-heading">Logout</h2>
            <p className="text-red-600 dark:text-red-300 mb-4 text-sm">Securely log out of your account.</p>
            <button onClick={handleLogout} className="px-6 py-2 flex items-center gap-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"><LogOut className="w-5 h-5" /> Logout</button>
          </div>
        </div>
      </div>

      {/* MODALS (Username, Password, Avatar) - Same as your existing ones */}
      {showEditModal && (
          <Modal title="Edit Profile" onClose={() => setShowEditModal(false)}>
            <label className="text-sm">Username</label>
            <input type="text" className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 mb-4 mt-1 bg-transparent" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowEditModal(false)} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700">Cancel</button>
              <button onClick={handleProfileUpdate} className="px-4 py-2 rounded bg-blue-600 text-white">Update</button>
            </div>
          </Modal>
        )}

        {showPasswordModal && (
          <Modal title="Change Password" onClose={() => setShowPasswordModal(false)}>
            <div className="space-y-3">
              <input type="password" placeholder="Old Password" className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-transparent" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
              <input type="password" placeholder="New Password" className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-transparent" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <input type="password" placeholder="Confirm New Password" className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 bg-transparent" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button onClick={() => setShowPasswordModal(false)} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700">Cancel</button>
              <button onClick={handlePasswordUpdate} className="px-4 py-2 rounded bg-green-600 text-white">Update Password</button>
            </div>
          </Modal>
        )}

        {showAvatarModal && (
          <Modal title="Update Avatar" onClose={() => setShowAvatarModal(false)}>
            <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files[0])} className="w-full border border-gray-300 dark:border-gray-700 rounded px-3 py-2 mb-4 mt-1 bg-transparent" />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowAvatarModal(false)} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700">Cancel</button>
              <button onClick={handleAvatarUpload} className="px-4 py-2 rounded bg-purple-600 text-white">Upload</button>
            </div>
          </Modal>
        )}
    </>
  );
}

/* Helper Components */
function DetailItem({ label, value, icon }) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-gray-500 dark:text-gray-300 mt-1">{icon}</div>
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-gray-900 dark:text-white font-semibold">{value}</p>
      </div>
    </div>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white dark:bg-[#0f1b2d] p-6 rounded-2xl w-full max-w-md relative shadow-2xl border border-white/10">
        <h2 className="text-xl font-bold mb-4 font-heading">{title}</h2>
        {children}
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">✕</button>
      </div>
    </div>
  );
}