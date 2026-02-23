import React, { createContext, useState, useEffect, useRef } from "react";
import { io } from "socket.io-client";
import api from "../utils/api";

export const ChatContext = createContext();

export const ChatProvider = ({ children }) => {

  // ✅ Cookie auth → user only used for UI / ID reference
  const [user, setUser] = useState(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [unreadMap, setUnreadMap] = useState({});
  const [showGroupInfo, setShowGroupInfo] = useState(false);

  const socketRef = useRef(null);
  const messageIdsRef = useRef(new Set());
  const activeConversationRef = useRef(null);

  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  // ================= SOCKET =================
  useEffect(() => {
    if (!user || socketRef.current) return;

    const socket = io("http://localhost:3001", {
      withCredentials: true, // 🔥 CRITICAL FOR COOKIE AUTH
      transports: ["websocket"],
    });

    socketRef.current = socket;

    socket.on("connect", () =>
      console.log("✅ Socket connected:", socket.id)
    );

    socket.on("disconnect", (reason) =>
      console.log("❌ Socket disconnected:", reason)
    );

    socket.on("connect_error", (err) =>
      console.error("⚠️ Socket error:", err.message)
    );


    // ---------- NEW MESSAGE ----------
    socket.on("new_message", (msg) => {
      if (messageIdsRef.current.has(msg._id)) return;
      messageIdsRef.current.add(msg._id);

      const convId =
        msg.conversation?._id ||
        msg.group?._id ||
        msg.conversation ||
        msg.group;

      if (!convId) return;

      const convObj = msg.conversation || msg.group;

      setConversations((prev) =>
        prev.find((c) => c._id === convId)
          ? prev
          : [convObj, ...prev]
      );

      if (activeConversationRef.current?._id === convId) {
        setMessages((prev) => [...prev, msg]);
      } else if (msg.sender?._id !== user?._id) {
        setUnreadMap((prev) => ({ ...prev, [convId]: true }));
      }
    });

    // ---------- MESSAGE READ ----------
    socket.on("message_read", ({ messageId, user: reader }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? {
              ...m,
              readBy: m.readBy?.some((r) => r._id === reader._id)
                ? m.readBy
                : [...(m.readBy || []), reader],
            }
            : m
        )
      );
    });

    // ---------- MESSAGE DELETE ----------
    socket.on("message_deleted", ({ messageId }) => {
      setMessages((prev) => prev.filter((m) => m._id !== messageId));
      messageIdsRef.current.delete(messageId);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);




  const fetchMe = async () => {
    try {
      const res = await api.get("/me", {
        withCredentials: true, // 🔥 required for cookies
      });

      if (res?.data?.data) {
        setUser(res.data.data);
        return res.data.data;
      }

      return null;
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem("user");
        setUser(null);
      }

      return null;
    }
  };

  useEffect(() => {
    const init = async () => {
      await fetchMe();
      setLoadingUser(false);
    };

    init();
  }, []);

  // ================= JOIN ROOMS =================
  useEffect(() => {
    if (!socketRef.current) return;

    conversations.forEach((conv) => {
      socketRef.current.emit("join_conversation", conv._id);
    });
  }, [conversations]);

  // ================= API HELPERS =================

  const fetchGroups = async () => {
    try {
      const res = await api.get("/groups");
      const groups = res.data.data || [];

      setConversations((prev) => {
        const existingIds = prev.map((c) => c._id);
        return [...prev, ...groups.filter((g) => !existingIds.includes(g._id))];
      });
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    }
  };

  const fetchMessages = async (conversationId, page = 0, limit = 30, setLocal = true) => {
    if (!conversationId) return [];

    try {
      const res = await api.get(
        `/${conversationId}/messages?page=${page}&limit=${limit}`
      );

      const msgs = (res.data.data || []).sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );

      if (setLocal) setMessages(msgs);
      return msgs;
    } catch (err) {
      console.error("Failed to fetch messages:", err);
      return [];
    }
  };

  const sendMessage = async (conversationId, content = "", file = null) => {
    if (!conversationId || (!content && !file)) return;
    try {
      const formData = new FormData();
      formData.append("conversationId", conversationId);
      if (content) formData.append("content", content);
      if (file) formData.append("media", file);

      const res = await api.post("/message/send", formData, { withCredentials: true });
      return res.data.data;
    } catch (err) {
      console.error("❌ Failed to send message:", err);
      throw err;
    }
  };

  const deleteMessage = async (messageId) => {
    await api.delete(`/${messageId}/delete`);
    setMessages((prev) => prev.filter((m) => m._id !== messageId));
    messageIdsRef.current.delete(messageId);
  };

  // ================= CONVERSATIONS =================

  const fetchConversations = async () => {
    try {
      const res = await api.get("/conversations");
      setConversations(res.data.data);
    } catch (err) {
      console.error("Failed to fetch conversations", err);
    }
  };

  const getOrCreateDM = async (userId) => {
    try {
      const res = await api.post("/dm", { userId });
      const convo = res.data.data;

      setConversations((prev) =>
        prev.find((c) => c._id === convo._id)
          ? prev
          : [convo, ...prev]
      );

      setActiveConversation(convo);
      return convo;
    } catch (err) {
      console.error("Failed to start DM:", err);
      throw err;
    }
  };

  // ================= GROUP OPS =================

  const joinGroup = async (groupId) => {
    const res = await api.post("/join", { groupId });
    const joinedGroup = res.data.data;

    setConversations((prev) => {
      const exists = prev.some((c) => c._id === joinedGroup._id);
      if (exists) {
        return prev.map((c) =>
          c._id === joinedGroup._id ? joinedGroup : c
        );
      }
      return [...prev, joinedGroup];
    });

    socketRef.current?.emit("join_conversation", joinedGroup._id);
    return joinedGroup;
  };

  const leaveGroup = async (groupId) => {
    await api.post("/leave", { groupId });
    setConversations((prev) => prev.filter((c) => c._id !== groupId));
  };

  const editGroup = async ({ groupId, name, image }) => {
    const formData = new FormData();
    formData.append("groupId", groupId);
    if (name) formData.append("name", name);
    if (image) formData.append("groupImage", image);

    const res = await api.post("/edit", formData);
    const updated = res.data.data;

    setConversations((prev) =>
      prev.map((c) => (c._id === updated._id ? updated : c))
    );

    setActiveConversation(updated);
    return updated;
  };

  const kickMember = async (groupId, memberId) => {
    const res = await api.post("/kick", { groupId, memberId });
    const updated = res.data.data;

    setConversations((prev) =>
      prev.map((c) => (c._id === updated._id ? updated : c))
    );

    setActiveConversation(updated);
  };

  const deleteGroup = async (groupId) => {
    await api.post("/delete", { groupId });
    setConversations((prev) => prev.filter((c) => c._id !== groupId));
    setActiveConversation(null);
  };

  // ================= INITIAL FETCH =================
  useEffect(() => {
    if (user) {
      fetchConversations();
      fetchGroups();
    }
  }, [user]);

  return (
    <ChatContext.Provider
      value={{
        user,
        loadingUser,
        fetchMe,
        conversations,
        messages,
        activeConversation,
        setActiveConversation,
        fetchMessages,
        sendMessage,
        setMessages,
        fetchGroups,
        deleteMessage,
        unreadMap,
        setUnreadMap,
        socketRef,
        fetchConversations,
        getOrCreateDM,
        joinGroup,
        leaveGroup,
        editGroup,
        kickMember,
        deleteGroup,
        showGroupInfo,
        setShowGroupInfo,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};