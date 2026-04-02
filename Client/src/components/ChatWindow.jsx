import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { ChatContext } from "../context/ChatContext.jsx";
// import { AuthContext } from "../context/AuthContext.jsx";
import MessageBubble from "./MessageBubble.jsx";
import MessageInput from "./MessageInput.jsx";
// import api from "../utils/api";


export default function ChatWindow() {
  // const { user } = useContext(AuthContext);
  const { user, activeConversation, setActiveConversation, fetchMessages, sendMessage, messages, setMessages, joinGroup, leaveGroup, conversations, setShowGroupInfo } = useContext(ChatContext);

  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [initialLoadDone, setInitialLoadDone] = useState(false);
  const [loadingConversation, setLoadingConversation] = useState(false);

  const containerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const shouldAutoScrollRef = useRef(true);

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [messageQuery, setMessageQuery] = useState("");

  const conversationId = activeConversation?._id;
  const isGroupConversation = Boolean(activeConversation?.isGroup);



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
    if (!conversationId) return;

    // 🚫 Non-members cannot load messages
    if (isGroupConversation && !isMember) {
      setMessages([]);
      setInitialLoadDone(false);
      return;
    }

    let cancelled = false;

    const loadInitial = async () => {
      setLoadingConversation(true);
      setInitialLoadDone(false);
      setPage(0);
      setHasMore(true);
      const msgs = await fetchMessages(conversationId, 0);
      if (cancelled) return;
      setMessages(msgs || []);
      setInitialLoadDone(true);
      setLoadingConversation(false);
      requestAnimationFrame(() => scrollToBottom());
    };

    loadInitial();

    return () => {
      cancelled = true;
      setLoadingConversation(false);
    };
  }, [conversationId, isGroupConversation, isMember, fetchMessages, setMessages]);

  // ----------------- Track manual scroll intent -----------------
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onScroll = () => {
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      shouldAutoScrollRef.current = distanceFromBottom < 140;
    };

    container.addEventListener("scroll", onScroll);
    onScroll();

    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  // ----------------- Auto-scroll on new messages -----------------
  useEffect(() => {
    if (!initialLoadDone) return;

    if (shouldAutoScrollRef.current) {
      scrollToBottom("smooth");
    }
  }, [messages, initialLoadDone]);

  const scrollToBottom = (behavior = "auto") => {
    const container = containerRef.current;
    if (!container) return;

    container.scrollTo({
      top: container.scrollHeight,
      behavior,
    });
  };

  // ----------------- Load older messages -----------------
  const loadOlderMessages = async () => {
    if (!activeConversation?._id || loadingOlder || !hasMore) return;
    setLoadingOlder(true);

    const container = containerRef.current;
    const prevScrollHeight = container?.scrollHeight || 0;
    const prevScrollTop = container?.scrollTop || 0;

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

      requestAnimationFrame(() => {
        const currContainer = containerRef.current;
        if (!currContainer) return;

        const newScrollHeight = currContainer.scrollHeight;
        currContainer.scrollTop = newScrollHeight - prevScrollHeight + prevScrollTop;
      });
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

  const visibleMessages = useMemo(() => {
    const q = messageQuery.trim().toLowerCase();
    if (!q) return messages;

    return messages.filter((m) => {
      const content = (m?.content || m?.message || "").toLowerCase();
      return content.includes(q);
    });
  }, [messages, messageQuery]);

  if (!activeConversation) {
    return <div className="flex-1 flex items-center justify-center text-muted-foreground">Select a conversation to start chatting</div>;
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
    <div className="z-0 flex min-w-0 flex-1 flex-col bg-background/95">
      {/* Header */}
      <div className="sticky top-0 z-20 border-b border-border bg-card/95 px-4 py-3 backdrop-blur-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
          <img
            src={
              isGroup
                ? activeConversation.groupImage || "/default-group.png"
                : otherUser?.avatar || "/default-user.png"
            }
            className="h-10 w-10 rounded-full border border-[color:color-mix(in_srgb,var(--brand-primary)_35%,white)] object-cover"
            alt="avatar"
          />
          <h2 className="text-xl font-bold tracking-tight text-[var(--brand-secondary)]">
            {isGroup ? activeConversation.name : otherUser?.name}
          </h2>
        </div>

          <div className="flex flex-col gap-2 md:min-w-[360px] md:max-w-md md:flex-1">
            <input
              type="text"
              value={messageQuery}
              onChange={(e) => setMessageQuery(e.target.value)}
              placeholder="Search messages..."
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none ring-offset-background transition focus:border-[color:color-mix(in_srgb,var(--brand-primary)_45%,white)] focus:ring-2 focus:ring-[color:color-mix(in_srgb,var(--brand-primary)_30%,white)]"
            />

            <div className="flex items-center justify-end gap-2">
              {/* Header actions */}
              {isGroup && !isMember && (
                <button
                  onClick={handleJoinGroup}
                  className="rounded-lg bg-[var(--brand-primary)] px-4 py-1.5 text-sm font-semibold text-[var(--brand-secondary)] transition-all hover:bg-[var(--brand-secondary)] hover:text-white"
                >
                  Join
                </button>
              )}

              {isGroup && isMember && (
                <div className="relative" ref={menuRef}>
                  <button
                    onClick={() => setMenuOpen(prev => !prev)}
                    className="rounded-md px-2 text-xl text-[var(--brand-secondary)] transition-colors hover:bg-accent"
                  >
                    ⋮
                  </button>

                  {menuOpen && (
                    <div className="absolute right-0 z-50 mt-2 w-40 rounded-lg border border-border bg-card shadow-lg">
                      <button
                        className="block w-full px-4 py-2 text-left transition-colors hover:bg-accent"
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
          </div>
        </div>
      </div>





      {/* Messages */}
      <div ref={containerRef} className="flex-1 space-y-2 overflow-y-auto bg-[linear-gradient(180deg,color-mix(in_srgb,var(--brand-primary)_5%,white),white)] p-4 md:p-5">

        {hasMore && (
          <button
            onClick={loadOlderMessages}
            disabled={loadingOlder}
            className="mb-2 rounded-full border border-[color:color-mix(in_srgb,var(--brand-primary)_35%,white)] bg-background px-3 py-1 text-xs font-semibold text-[var(--brand-secondary)] transition-colors hover:bg-[color:color-mix(in_srgb,var(--brand-primary)_12%,white)]"
          >
            {loadingOlder ? "Loading..." : "Load older messages"}
          </button>
        )}

        {loadingConversation ? (
          <div className="mt-10 text-center text-sm text-muted-foreground">Loading messages...</div>
        ) : visibleMessages.length ? (
          visibleMessages.map((msg, idx) => {
            const prevMsg = visibleMessages[idx - 1];
            const showDaySeparator =
              !prevMsg || new Date(prevMsg.createdAt).toDateString() !== new Date(msg.createdAt).toDateString();

            return (
              <React.Fragment key={msg._id}>
                {showDaySeparator && (
                  <div className="my-2 flex justify-center">
                    <span className="rounded-full border border-border bg-background/90 px-3 py-1 text-xs text-muted-foreground shadow-sm">
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                )}
                <MessageBubble message={msg}
                  isGroup={activeConversation.isGroup}
                />
              </React.Fragment>
            );
          })
        ) : (
          <p className="text-muted-foreground text-center mt-4">
            {messageQuery.trim() ? "No matching messages" : "No messages yet"}
          </p>
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
        <div className="border-t border-border bg-[color:color-mix(in_srgb,var(--brand-primary)_14%,white)] p-4 text-center text-[var(--brand-secondary)]">
          Join the group to start chatting
        </div>
      )}
    </div>
  );
}
