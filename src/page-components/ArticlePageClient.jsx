"use client";
import { useEffect, useState } from 'react';
import { commentsAPI } from '../lib/api';
import { useStore } from '../store/useStore';
import { MessageSquare, Send, Loader, User } from 'lucide-react';

export default function CommentSection({ articleId }) {
  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Zustand store se user aur openLoginModal lein
  const { user, token, openLoginModal } = useStore();

  // 1. Comments Fetch karein
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const data = await commentsAPI.getByArticle(articleId);
        setComments(data);
      } catch (err) {
        console.error("Comments load nahi ho paye", err);
      }
    };
    if (articleId) fetchComments();
  }, [articleId]);

  
const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!user || !token) {
    openLoginModal(); 
    return;
  }

  if (!message.trim()) return;

  setLoading(true);
  try {
    // 🔥 Strapi mang raha hai user_name aur user ka relation
    const payload = {
      message: message,
      article: articleId, // Article ID
      user_name: user.username || user.fullName, // 👈 Yeh missing tha
      user: user.id, // User relation ke liye ID
      moderation_status: "pending", // Default status
      publishedAt: new Date().toISOString() // Direct publish karne ke liye
    };

    const response = await commentsAPI.create(payload);

    // List update karein (normalizeComment handle kar lega formatting)
    setComments((prev) => [response, ...prev]);
    setMessage(''); 
  } catch (err) {
    console.error("Strapi Error:", err.response?.data || err.message);
    alert("Comment save nahi hua. Username required hai.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="mt-10 bg-white dark:bg-slate-800 p-6 rounded-xl shadow">
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <MessageSquare className="text-pink-500" />
        Comments ({comments.length})
      </h3>

      {/* Input Area */}
      <form onSubmit={handleSubmit} className="mb-6">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={user ? "Write a comment..." : "Login to join the discussion"}
          className="w-full p-3 border rounded-lg dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-pink-500"
          rows="3"
        />
        <button
          type="submit"
          disabled={loading || !message.trim()}
          className="mt-2 px-6 py-2 bg-pink-600 text-white rounded-lg flex items-center gap-2 hover:bg-pink-700 disabled:bg-gray-400"
        >
          {loading ? <Loader className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
          Post Comment
        </button>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {comments.length > 0 ? (
          comments.map((c) => (
            <div key={c.id} className="border-b dark:border-slate-700 pb-4">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="w-4 h-4 text-gray-500" />
                </div>
                <span className="font-bold text-sm">
                  {/* Yahan user ka name check karein */}
                  {c.user?.username || c.user?.fullName || "Anonymous"}
                </span>
                <span className="text-xs text-gray-400">
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-700 dark:text-gray-300 ml-10">{c.message}</p>
            </div>
          ))
        ) : (
          <p className="text-gray-500 text-center">No comments yet.</p>
        )}
      </div>
    </div>
  );
}