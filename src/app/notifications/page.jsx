"use client";

import React, { useState, useEffect } from 'react';
import { Bell, CheckCheck, Trash2, Eye, MessageCircle, Heart, UserPlus, FileText, Award, Sparkles, Clock } from 'lucide-react';
import LayoutWrapper from '../LayoutWrapper';
import { notificationsAPI } from '../../lib/api/notifications';


const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);

  const STRAPI_URL = process.env.STRAPI_BACKEND_URL || "http://13.201.143.7:1337";
  

  useEffect(() => {
    loadUserAndNotifications();
  }, []);

  const loadUserAndNotifications = async () => {
    setLoading(true);
    
    try {
      const userStr = localStorage.getItem('user');
      const tokenStr = localStorage.getItem('token');
      
      // console.log("User from localStorage:", userStr);
      // console.log("Token from localStorage:", tokenStr ? "Present" : "Missing");
      
      if (!userStr || !tokenStr) {
        console.log("No user or token found");
        setLoading(false);
        return;
      }
      
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      setToken(tokenStr);
      
      await loadNotifications(user.id);
      
    } catch (error) {
      console.error("Error loading user:", error);
      setLoading(false);
    }
  };

  // ✅ Direct API call - Most reliable method
  // ✅ DEBUG VERSION

const loadNotifications = async (userId) => {
  try {
    console.log("========== NOTIFICATION DEBUG ==========");
    console.log("USER ID:", userId);

    const resultData = await notificationsAPI.getUserNotifications(userId);

    console.log("NOTIFICATIONS FETCHED:", resultData);

    let fetchedNotifications = [];

    if (Array.isArray(resultData)) {
      fetchedNotifications = resultData.map((item, index) => {

        console.log(`----- Notification ${index + 1} -----`);
        console.log("RAW ITEM:", item);

        return {
          id: item.id,
          documentId: item.documentId,

          title:
            item.attributes?.title ||
            item.title ||
            "No Title",

          message:
            item.attributes?.message ||
            item.message ||
            "No Message",

          type:
            item.attributes?.type ||
            item.type ||
            "default",

          state:
            item.attributes?.state ||
            item.state ||
            "unread",

          isRead:
            item.attributes?.isRead ??
            item.isRead ??
            false,

          recipient:
            item.attributes?.recipient ||
            item.recipient ||
            null,

          metadata:
            item.attributes?.metadata ||
            item.metadata ||
            {},

          createdAt:
            item.attributes?.createdAt ||
            item.createdAt ||
            new Date(),

          updatedAt:
            item.attributes?.updatedAt ||
            item.updatedAt ||
            new Date(),
        };
      });
    } else {
      console.error("resultData is NOT ARRAY");
      console.log(resultData);
    }

    console.log("FINAL PROCESSED NOTIFICATIONS:", fetchedNotifications);

    setNotifications(fetchedNotifications);

    const unread = fetchedNotifications.filter(
      (n) => !n.isRead
    ).length;

    console.log("UNREAD COUNT:", unread);

    setUnreadCount(unread);

  } catch (error) {

    console.error("========== LOAD NOTIFICATION ERROR ==========");
    console.error(error);

    setNotifications([]);
    setUnreadCount(0);

  } finally {
    setLoading(false);
  }
};

 const handleMarkAsRead = async (notification) => {

  try {

    const notificationId =
      notification.documentId || notification.id;

    console.log("MARK AS READ ID:", notificationId);

    const bodyData = {
      data: {
        isRead: true,
        state: "read",
      },
    };

    console.log("REQUEST BODY:", bodyData);

    const response = await fetch(
      `${STRAPI_URL}/api/notifications/${notificationId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyData),
      }
    );

    console.log("PUT STATUS:", response.status);

    const result = await response.json();

    console.log("PUT RESPONSE:", result);

    if (!response.ok) {
      console.error("PUT ERROR:", result);
      return;
    }

    setNotifications((prev) =>
      prev.map((notif) =>
        (notif.documentId === notificationId ||
          notif.id === notificationId)
          ? {
              ...notif,
              isRead: true,
              state: "read",
            }
          : notif
      )
    );

  } catch (error) {
    console.error("MARK READ ERROR:", error);
  }
};

  const handleMarkAllRead = async () => {
    const unreadNotifications = notifications.filter(n => !n.isRead);
    for (const notification of unreadNotifications) {
      await handleMarkAsRead(notification);
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  };

  const handleDelete = async (notification) => {
    if (!confirm("Are you sure you want to delete this notification?")) return;
    
    const notificationId = notification.documentId || notification.id;
    
    try {
      const response = await fetch(`${STRAPI_URL}/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        setNotifications(prev => prev.filter(n => 
          (n.documentId !== notificationId && n.id !== notificationId)
        ));
        if (!notification.isRead) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error("Error deleting:", error);
      alert("Failed to delete notification");
    }
  };

  const getIconByType = (type) => {
    switch(type) {
      case 'welcome': return <Sparkles className="w-5 h-5 text-purple-500" />;
      case 'author_request': return <FileText className="w-5 h-5 text-blue-500" />;
      case 'article_status': return <FileText className="w-5 h-5 text-orange-500" />;
      case 'post_like': return <Heart className="w-5 h-5 text-red-500" />;
      case 'comment': return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case 'follow': return <UserPlus className="w-5 h-5 text-green-500" />;
      default: return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'Just now';
    const diff = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Please Login</h2>
          <p className="text-gray-500 dark:text-gray-400">Login to see your notifications</p>
          <button 
            onClick={() => window.location.href = '/login'}
            className="mt-4 px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <LayoutWrapper>
    <div className="max-w-7xl mx-auto px-4 py-6 bg-[#f6f6f6] rounded-2xl dark:bg-gray-800">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-xl">
              <Bell className="w-6 h-6 text-pink-600 dark:text-pink-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Hello, {currentUser.username}!
              </p>
            </div>
          </div>
          
          {unreadCount > 0 && (
            <button 
              onClick={handleMarkAllRead}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-pink-600 bg-pink-50 rounded-lg hover:bg-pink-100"
            >
              <CheckCheck className="w-4 h-4" />
              Mark all as read ({unreadCount})
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{notifications.length}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total Notifications</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-pink-600">{unreadCount}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">Unread</p>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl">
              <Bell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">No notifications yet</p>
              <p className="text-sm text-gray-400 mt-2">
                When someone likes or comments on your posts, you'll see them here
              </p>
            </div>
          ) : (
            notifications.map((notif) => (
              <div 
                key={notif.documentId || notif.id}
                className={`group relative bg-white dark:bg-gray-800 rounded-xl transition-all ${
                  !notif.isRead 
                    ? 'border-l-4 border-l-pink-500 shadow-sm' 
                    : 'border border-gray-100 dark:border-gray-700'
                }`}
              >
                <div className="p-4 pr-12">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        !notif.isRead ? 'bg-pink-100' : 'bg-gray-100'
                      }`}>
                        {getIconByType(notif.type)}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h3 className={`text-sm font-semibold ${
                        !notif.isRead ? 'text-gray-900' : 'text-gray-600'
                      }`}>
                        {notif.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <p className="text-xs text-gray-400">
                          {formatTimeAgo(notif.createdAt)}
                        </p>
                        {!notif.isRead && (
                          <span className="text-xs text-pink-600 flex items-center gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-pink-600"></div>
                            New
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="flex items-center gap-1">
                    {!notif.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notif)}
                        className="p-1.5 text-gray-400 hover:text-pink-600"
                        title="Mark as read"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notif)}
                      className="p-1.5 text-gray-400 hover:text-red-600"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      </LayoutWrapper>
  );
};

export default NotificationsPage;