"use client";
import { useEffect, useState, useMemo } from 'react';
import { commentsAPI } from '../lib/api'; 
import { useStore } from '../store/useStore';
import { MessageSquare, Send, Loader, User, Edit2, Trash2, MoreVertical, CornerDownRight } from 'lucide-react';

export default function CommentSection({ articleId }) {
  const [comments, setComments] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  
  // States
  const [editingId, setEditingId] = useState(null);
  const [editMessage, setEditMessage] = useState('');
  const [replyingId, setReplyingId] = useState(null); // Kiske niche dabba kholna hai
  const [replyMessage, setReplyMessage] = useState('');
  const [replyLoading, setReplyLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null); 
  const [expandedThreads, setExpandedThreads] = useState({}); // Kiske replies dikhane hain

  const { user, token, openLoginModal } = useStore();

  useEffect(() => {
    const fetchComments = async () => {
      try {
        if (!articleId) return;
        const currentUserId = user?.documentId || user?.id || null;
        const data = await commentsAPI.getByArticle(articleId, currentUserId);
        setComments(data);
      } catch (err) {
        console.error("Fetch error", err);
      }
    };
    fetchComments();
  }, [articleId, user]);

  // Threading Logic (Main comments aur replies ko alag karna)
  const threads = useMemo(() => {
    const parents = [];
    const children = [];
    comments.forEach(c => {
      if (c.message.trim().startsWith('@')) children.push(c);
      else parents.push({ ...c, replies: [] });
    });

    children.forEach(child => {
      const targetUser = child.message.trim().split(' ')[0].substring(1);
      const parent = parents.find(p => p.userName === targetUser);
      if (parent) parent.replies.push(child);
      else parents.push({ ...child, replies: [] });
    });
    return parents;
  }, [comments]);

  const canPost = () => {
    const lastTime = localStorage.getItem('last_c_time');
    if (lastTime && (Date.now() - lastTime < 30000)) {
      alert("Bhai thoda wait karo! 30 seconds baad comment karein.");
      return false;
    }
    return true;
  };

  const checkForSpam = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|([a-zA-Z0-9]+\.[a-z]{2,})/i;
    if (urlRegex.test(text)) return "Links are not allowed in comments.";
    const badWords = ["fuck", "bitch", "chutiya", "madarchod", "bhenchod", "asshole", "mc", "bc", "bsdk", "gandu" ,"Maa ki chut teri", "lude", " kutiya","kutta"]; 
    const lowerText = text.toLowerCase();
    for (let word of badWords) {
      if (lowerText.includes(word)) return "Please use appropriate language.";
    }
    return null; 
  };

  const handleReplyClick = (id, userName) => {
    setReplyingId(id === replyingId ? null : id); // Toggle reply box
    setReplyMessage(`@${userName} `);
    setExpandedThreads(prev => ({ ...prev, [id]: true })); // Reply karte time history dikha do
  };

  const handleSubmit = async (e, isReply = false, parentDocId = null) => {
    if (e) e.preventDefault();
    if (!user) return openLoginModal();
    
    const msg = isReply ? replyMessage : message;
    if (!msg.trim() || !canPost()) return;

    const spamError = checkForSpam(msg);
    if (spamError) return alert(spamError);

    isReply ? setReplyLoading(true) : setLoading(true);

    try {
      const payload = {
        message: msg.trim(),
        article: articleId,
        user_name: user.username || user.fullName,
        user: user.documentId || user.id,
        moderation_status: "approved",
        publishedAt: new Date().toISOString()
      };

      const res = await commentsAPI.create(payload);
      setComments([res, ...comments]);
      
      if (isReply) {
        setReplyMessage('');
        setReplyingId(null);
        setExpandedThreads(prev => ({ ...prev, [parentDocId]: true })); // Naya reply dikhane ke liye expand rakho
      } else {
        setMessage(''); 
      }
      localStorage.setItem('last_c_time', Date.now());
    } catch (err) {
      alert("Error saving comment");
    } finally {
      isReply ? setReplyLoading(false) : setLoading(false);
    }
  };

  const renderSingleComment = (c, isNested = false, parentId = null) => {
    const isOwner = user && (c.user?.documentId === user.documentId || c.user?.id === user.id);
    const isEditing = editingId === c.documentId;

    return (
      <div className={`flex gap-3 ${isNested ? 'mt-4 border-l-2 border-gray-200 dark:border-slate-700 pl-4 ml-2' : ''}`}>
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-orange-400 flex items-center justify-center shrink-0 shadow-sm">
          <User size={16} className="text-white" />
        </div>
        
        <div className="flex-1">
          <div className="bg-gray-50 dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none inline-block min-w-[200px] relative">
            <div className="flex justify-between items-center gap-4">
              <span className="text-[13px] font-bold text-gray-900 dark:text-white">{c.userName || "Anonymous"}</span>
              
              {/* Edit/Delete Three Dot Menu */}
              {isOwner && !isEditing && (
                <div className="relative">
                  <button onClick={() => setOpenMenuId(openMenuId === c.documentId ? null : c.documentId)} className="text-gray-400 hover:text-gray-700">
                    <MoreVertical size={14} />
                  </button>
                  {openMenuId === c.documentId && (
                    <div className="absolute right-0 mt-1 w-24 bg-white dark:bg-slate-700 shadow-lg rounded-lg border dark:border-slate-600 z-10 overflow-hidden">
                      <button onClick={() => { setEditingId(c.documentId); setEditMessage(c.message); setOpenMenuId(null); }} className="w-full text-left px-3 py-2 text-xs hover:bg-gray-100 dark:hover:bg-slate-600 flex items-center gap-2">
                        <Edit2 size={12} /> Edit
                      </button>
                      <button onClick={async () => { 
                        if(window.confirm("Delete?")) {
                          await commentsAPI.delete(c.documentId); 
                          setComments(comments.filter(item => item.documentId !== c.documentId)); 
                        }
                      }} className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-slate-600 flex items-center gap-2">
                        <Trash2 size={12} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Comment Text / Edit Box */}
            {isEditing ? (
              <div className="mt-2">
                <textarea value={editMessage} onChange={(e) => setEditMessage(e.target.value)} className="w-full p-2 text-sm bg-white dark:bg-slate-700 rounded border border-pink-200 outline-none focus:border-pink-500" rows="2" />
                <div className="flex justify-end gap-3 mt-2">
                  <button onClick={() => setEditingId(null)} className="text-[11px] text-gray-500">Cancel</button>
                  <button onClick={async () => { const res = await commentsAPI.update(c.documentId, { message: editMessage }); setComments(comments.map(item => item.documentId === c.documentId ? res : item)); setEditingId(null); }} className="text-[11px] text-blue-600 font-bold">Save</button>
                </div>
              </div>
            ) : (
              <p className="text-[14px] text-gray-700 dark:text-gray-300 mt-1">
                {c.message.split(' ').map((w, i) => w.startsWith('@') ? <span key={i} className="text-blue-600 dark:text-blue-400 font-medium">{w} </span> : w + ' ')}
              </p>
            )}
          </div>

          {/* Action Bar (Date & Reply Button) */}
          <div className="flex items-center gap-4 mt-1 ml-2">
            <span className="text-[11px] text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
            {!isEditing && !isNested && (
              <button onClick={() => handleReplyClick(c.documentId, c.userName)} className="text-[11px] font-bold text-gray-500 hover:text-gray-800 dark:hover:text-gray-300">
                Reply
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="mt-10 bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-2xl border dark:border-slate-800 shadow-sm">
      <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
       Comments ({comments.length})
      </h3>

      {/* Main Comment Box */}
      <div className="flex gap-3 mb-8">
        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
          <User size={20} className="text-gray-400" />
        </div>
        <div className="flex-1">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Add a public comment..."
            className="w-full p-3 bg-gray-50 dark:bg-slate-800 rounded-xl text-sm border focus:ring-1 focus:ring-pink-500 outline-none resize-none"
            rows="2"
          />
          <div className="flex justify-end mt-2">
            <button onClick={(e) => handleSubmit(e, false)} disabled={loading || !message.trim()} className="bg-pink-600 hover:bg-pink-700 text-white text-[13px] font-bold px-4 py-2 rounded-full flex items-center gap-2 transition-all disabled:opacity-50">
              {loading ? <Loader className="animate-spin" size={14} /> : "Post"}
            </button>
          </div>
        </div>
      </div>

      {/* Threads */}
      <div className="space-y-6">
        {threads.map((parent) => (
          <div key={parent.id}>
            
            {/* 1. MAIN COMMENT */}
            {renderSingleComment(parent)}

            {/* 2. REPLY INPUT BOX (Sirf tab dikhega jab "Reply" click hoga) */}
            {replyingId === parent.documentId && (
              <div className="ml-11 mt-3 flex gap-2 items-start animate-in slide-in-from-top-1">
                <CornerDownRight size={16} className="text-gray-400 mt-2 shrink-0" />
                <div className="flex-1">
                  <textarea
                    autoFocus
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    placeholder="Write a reply..."
                    className="w-full p-2 text-sm bg-gray-50 dark:bg-slate-800 border rounded-lg focus:border-pink-500 outline-none resize-none"
                    rows="1"
                  />
                  <div className="flex justify-end gap-3 mt-1">
                    <button onClick={() => setReplyingId(null)} className="text-[11px] font-medium text-gray-500">Cancel</button>
                    <button onClick={() => handleSubmit(null, true, parent.documentId)} disabled={replyLoading || !replyMessage.trim()} className="text-[11px] bg-blue-600 text-white font-medium px-3 py-1 rounded-full flex items-center">
                      {replyLoading ? <Loader className="animate-spin" size={12} /> : "Reply"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* 3. VIEW REPLIES TOGGLE BUTTON */}
            {parent.replies.length > 0 && (
              <button 
                onClick={() => setExpandedThreads(prev => ({ ...prev, [parent.documentId]: !prev[parent.documentId] }))}
                className="ml-11 mt-2 text-[12px] font-bold text-blue-600 hover:text-blue-800 flex items-center gap-2"
              >
                <div className="w-6 border-t border-blue-600"></div>
                {expandedThreads[parent.documentId] ? "Hide replies" : `View ${parent.replies.length} replies`}
              </button>
            )}

            {/* 4. HIDDEN REPLIES LIST */}
            {expandedThreads[parent.documentId] && (
              <div className="ml-11 space-y-2 mt-2">
                {parent.replies.map(reply => renderSingleComment(reply, true, parent.documentId))}
              </div>
            )}

          </div>
        ))}
      </div>
    </div>
  );
}