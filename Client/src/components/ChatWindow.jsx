import React, { useContext, useEffect, useRef, useState } from "react";
import { ChatContext } from "../context/ChatContext.jsx";
// import { AuthContext } from "../context/AuthContext.jsx";
import MessageBubble from "./MessageBubble.jsx";
import MessageInput from "./MessageInput.jsx";
// import api from "../utils/api";


export default function ChatWindow() {
  // const { user } = useContext(AuthContext);
  const { user, activeConversation, setActiveConversation, fetchMessages, sendMessage, messages, setMessages, fetchConversations, joinGroup, leaveGroup, conversations, setShowGroupInfo } = useContext(ChatContext);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const containerRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);



  const isGroup = activeConversation?.isGroup;

  const isMember =
    isGroup &&
    conversations.some(
      c => c._id === activeConversation._id &&
        c.participants?.some(p => p._id === user._id)
    );



  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);


  // ----------------- Load initial messages -----------------
  useEffect(() => {
    if (!activeConversation?._id) return;

    // 🚫 Non-members cannot load messages
    if (activeConversation.isGroup && !isMember) {
      setMessages([]);
      return;
    }


    const loadInitial = async () => {
      setPage(0);
      setHasMore(true);
      const msgs = await fetchMessages(activeConversation._id, 0);
      setMessages(msgs);
      setInitialLoadDone(true);
      requestAnimationFrame(() => scrollToBottom());
    };

    loadInitial();
  }, [activeConversation, isMember]);

  // ----------------- Auto-scroll on new messages -----------------
  useEffect(() => {
    if (!initialLoadDone) return;
    const container = containerRef.current;
    if (!container) return;

    const distanceFromBottom = container.scrollHeight - container.scrollTop - container.clientHeight;
    if (distanceFromBottom < 150) scrollToBottom();
  }, [messages, initialLoadDone]);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  // ----------------- Load older messages -----------------
  const loadOlderMessages = async () => {
    if (!activeConversation?._id || loadingOlder || !hasMore) return;
    setLoadingOlder(true);

    const nextPage = page + 1;
    const older = await fetchMessages(activeConversation._id, nextPage);

    if (!older || older.length === 0) {
      setHasMore(false);
    } else {
      setMessages(prev => {
        const existingIds = new Set(prev.map(m => m._id));
        return [...older.filter(m => !existingIds.has(m._id)), ...prev];
      });
      setPage(nextPage);
    }

    setLoadingOlder(false);
  };

  // ----------------- Send message -----------------
  const [newMessage, setNewMessage] = useState("");
  const handleSend = async () => {
    if (isGroup && !isMember) return;
    if (!newMessage.trim()) return;
    if (!newMessage.trim() || !activeConversation?._id) return;
    try {
      await sendMessage(activeConversation._id, newMessage.trim());
      setNewMessage("");
      scrollToBottom();
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };


  const handleSendMedia = async (file, text) => {
    if (!activeConversation?._id) return;
    try {
      await sendMessage(activeConversation._id, text?.trim() || "", file);
      scrollToBottom();
    } catch (err) {
      console.error("Failed to send media:", err);
    }
  };



  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!activeConversation) {
    return <div className="flex-1 flex items-center justify-center text-gray-400">Select a conversation to start chatting</div>;
  }

  const otherUser =
    !activeConversation.isGroup &&
      Array.isArray(activeConversation.participants)
      ? activeConversation.participants.find(p => p._id !== user._id)
      : null;









  const handleJoinGroup = async () => {
    try {
      const updatedGroup = await joinGroup(activeConversation._id);

      if (updatedGroup) {
        setActiveConversation(updatedGroup);
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to join group");
    }
  };




  //-------------------- Leave Group ---------------------------


  const handleLeaveGroup = async () => {
    if (!window.confirm("Are you sure you want to leave this group?")) return;

    try {
      await leaveGroup(activeConversation._id);

      setActiveConversation(null);
      setMessages([]);
    } catch (err) {
      console.error(err);
      alert("Failed to leave group");
    }
  };



  // ----------------- Helper for day separator -----------------
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {/* Header */}
      <div className="p-4 bg-white border-b flex items-center justify-between">
        <div className="flex items-center gap-4">
          <img
            src={
              isGroup
                ? activeConversation.groupImage || "/default-group.png"
                : otherUser?.avatar || "/default-user.png"
            }
            className="w-10 h-10 rounded-full"
            alt="avatar"
          />
          <h2 className="text-xl font-bold">
            {isGroup ? activeConversation.name : otherUser?.name}
          </h2>
        </div>

        {/* Header actions */}
        {isGroup && !isMember && (
          <button
            onClick={handleJoinGroup}
            className="px-4 py-1 rounded bg-green-500 text-white hover:bg-green-600"
          >
            Join
          </button>
        )}

        {isGroup && isMember && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(prev => !prev)}
              className="text-xl px-2"
            >
              ⋮
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow z-50">
                <button
                  className="block w-full px-4 py-2 text-left hover:bg-gray-100"
                  onClick={() => {
                    setMenuOpen(false);
                    setShowGroupInfo(true); // ✅ switch view
                  }}
                >
                  Group Info
                </button>


                <button
                  className="block w-full px-4 py-2 text-left text-red-600 hover:bg-red-50"
                  onClick={handleLeaveGroup}
                >
                  Leave Group
                </button>
              </div>
            )}
          </div>
        )}
      </div>





      {/* Messages */}
      <div ref={containerRef} className="flex-1 overflow-y-auto p-4 space-y-2">
        {hasMore && (
          <button
            onClick={loadOlderMessages}
            disabled={loadingOlder}
            className="mb-2 text-sm text-blue-500 hover:underline"
          >
            {loadingOlder ? "Loading..." : "Load older messages"}
          </button>
        )}

        {messages.length ? (
          messages.map((msg, idx) => {
            const prevMsg = messages[idx - 1];
            const showDaySeparator =
              !prevMsg || new Date(prevMsg.createdAt).toDateString() !== new Date(msg.createdAt).toDateString();

            return (
              <React.Fragment key={msg._id}>
                {showDaySeparator && (
                  <div className="flex justify-center text-gray-500 text-sm my-2">
                    {formatDate(msg.createdAt)}
                  </div>
                )}
                <MessageBubble message={msg}
                  isGroup={activeConversation.isGroup}
                />
              </React.Fragment>
            );
          })
        ) : (
          <p className="text-gray-400 text-center mt-4">No messages yet</p>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {(!isGroup || isMember) ? (
        <MessageInput
          value={newMessage}
          onChange={setNewMessage}
          onSend={handleSend}
          onSendMedia={handleSendMedia}
          onKeyPress={handleKeyPress}
        />
      ) : (
        <div className="p-4 text-center text-gray-500 bg-gray-100">
          Join the group to start chatting
        </div>
      )}
    </div>
  );
}
