import React, { useState, useContext, useEffect } from "react";
import { ChatContext } from "../context/ChatContext.jsx";
// import { AuthContext } from "../context/AuthContext.jsx";
import UserSearch from "./UserSearch";
import GroupModal from "./GroupModal";

function ToggleButton({ label, isOpen, onToggle }) {
  return (
    <button
      className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-[15px] font-semibold text-[var(--brand-secondary)] transition-colors hover:bg-[color:color-mix(in_srgb,var(--brand-primary)_15%,white)]"
      onClick={onToggle}
    >
      <span>{label}</span>
      <span className="text-xl font-bold text-[var(--brand-secondary)]">{isOpen ? "−" : "+"}</span>
    </button>
  );
}

const getConversationDisplay = (conv, userId) => {
  if (!conv) return { name: "Unknown", avatar: "/default-user.png" };
  if (conv.isGroup) return { name: conv.name || "Unnamed Group", avatar: conv.groupImage || "/default-group.png" };
  const participants = conv.participants || [];
  const otherUser = participants.find(p => p._id !== userId) || participants[0];
  return { name: otherUser?.name || "Unknown", avatar: otherUser?.avatar || "/default-user.png" };
};

export default function ChatSidebar({ onSelectConversation }) {
  // const { user } = useContext(AuthContext);
  const { user, conversations, activeConversation, setActiveConversation, unreadMap, setUnreadMap, fetchConversations, getOrCreateDM } =
    useContext(ChatContext);

  const [openSections, setOpenSections] = useState({ directs: true, myGroups: true });
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  const toggleSection = key => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  const directConversations = conversations.filter(c => !c.isGroup);
  const myGroups = conversations.filter(c => c.isGroup);

  const handleSelectConversation = async (conv) => {
    if (onSelectConversation) {
      onSelectConversation(conv);
    } else {
      setActiveConversation(conv);
    }

    // const msgs = await fetchMessages(conv._id);
    // setMessages(msgs);

    // Clear unread for this conversation
    setUnreadMap(prev => {
      const copy = { ...prev };
      delete copy[conv._id];
      return copy;
    });
  };






  // Only log unreadMap when it actually changes
  useEffect(() => {
    console.log("Unread Map updated:", Object.keys(unreadMap));
  }, [unreadMap]);

  return (
    <div className="relative z-30 flex w-full min-h-0 flex-col border-r border-border bg-[linear-gradient(180deg,color-mix(in_srgb,var(--brand-primary)_8%,white),color-mix(in_srgb,var(--brand-primary)_3%,white))] p-4 md:w-[340px] md:shrink-0 md:p-5">
      <h2 className="mb-1 text-2xl font-bold tracking-tight text-[var(--brand-secondary)]">Chats</h2>
      <p className="mb-3 text-xs text-muted-foreground">Stay connected with your prep groups</p>

      <UserSearch
        onSelect={(item) => {
           if (item.type === "group") {
            setActiveConversation(item);
          } else {
            getOrCreateDM(item._id);
          }
        }}
      />




      <div className="mt-4 min-h-0 flex-1 space-y-4 overflow-y-auto pr-1">
        {/* Direct Messages */}
        <div>
          <ToggleButton label="Direct Messages" isOpen={openSections.directs} onToggle={() => toggleSection("directs")} />
          {openSections.directs && (
            <div className="ml-1 space-y-1">
              {directConversations.length ? directConversations.map((conv, idx) => {
                const { name, avatar } = getConversationDisplay(conv, user._id);
                return (
                  <div
                    key={conv._id || `dm-${idx}`}
                    onClick={() => handleSelectConversation(conv)}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border px-2.5 py-2 text-sm transition-all ${activeConversation?._id === conv._id ? "border-[color:color-mix(in_srgb,var(--brand-primary)_45%,white)] bg-[color:color-mix(in_srgb,var(--brand-primary)_22%,white)] text-[var(--brand-secondary)] shadow-sm" : "border-transparent hover:border-[color:color-mix(in_srgb,var(--brand-primary)_28%,white)] hover:bg-accent"}`}
                  >
                    <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover" />
                    <span className="flex-1 truncate">{name}</span>
                    {unreadMap[conv._id] && <span className="h-2 w-2 rounded-full bg-[var(--brand-primary)]" />}
                  </div>
                );
              }) : <p className="text-muted-foreground ml-2">No DMs yet</p>}
            </div>
          )}
        </div>

        {/* Groups */}
        <div>
          <ToggleButton label="Groups" isOpen={openSections.myGroups} onToggle={() => toggleSection("myGroups")} />
          {openSections.myGroups && (
            <div className="ml-1 space-y-1">
              {myGroups.length ? myGroups.map((conv, idx) => {
                const { name, avatar } = getConversationDisplay(conv, user._id);
                return (
                  <div
                    key={conv._id || `group-${idx}`}
                    onClick={() => handleSelectConversation(conv)}
                    className={`flex cursor-pointer items-center gap-2 rounded-xl border px-2.5 py-2 text-sm transition-all ${activeConversation?._id === conv._id ? "border-[color:color-mix(in_srgb,var(--brand-primary)_45%,white)] bg-[color:color-mix(in_srgb,var(--brand-primary)_22%,white)] text-[var(--brand-secondary)] shadow-sm" : "border-transparent hover:border-[color:color-mix(in_srgb,var(--brand-primary)_28%,white)] hover:bg-accent"}`}
                  >
                    <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover" />
                    <span className="flex-1 truncate">{name}</span>
                    {unreadMap[conv._id] && <span className="h-2 w-2 rounded-full bg-[var(--brand-primary)]" />}
                  </div>
                );
              }) : <p className="text-muted-foreground ml-2">No groups yet</p>}
            </div>
          )}
        </div>
      </div>

      <div className="mt-3 shrink-0 border-t border-[color:color-mix(in_srgb,var(--brand-secondary)_12%,white)] pt-3">
        <button
          onClick={() => setIsGroupModalOpen(true)}
          className="w-full rounded-xl border border-[color:color-mix(in_srgb,var(--brand-secondary)_20%,white)] bg-[var(--brand-primary)] px-4 py-2.5 font-semibold text-[var(--brand-secondary)] transition-all hover:-translate-y-0.5 hover:bg-[var(--brand-secondary)] hover:text-white hover:shadow-md"
        >
          + Create Group
        </button>
      </div>

      <GroupModal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        onGroupCreated={async (group) => {
          await fetchConversations();   // 🔥 refresh sidebar
          setActiveConversation(group); // auto open new group
          setIsGroupModalOpen(false);
        }}
      />

    </div>
  );
}
