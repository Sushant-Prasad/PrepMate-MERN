import React, { useState, useContext, useEffect } from "react";
import { ChatContext } from "../context/ChatContext.jsx";
// import { AuthContext } from "../context/AuthContext.jsx";
import UserSearch from "./UserSearch";
import GroupModal from "./GroupModal";

function ToggleButton({ label, isOpen, onToggle }) {
  return (
    <button
      className="flex justify-between items-center w-full text-lg font-semibold mb-2 px-2 py-1 rounded hover:bg-gray-100"
      onClick={onToggle}
    >
      <span>{label}</span>
      <span className="text-xl font-bold">{isOpen ? "−" : "+"}</span>
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
  const { user, conversations, activeConversation, setActiveConversation, unreadMap, setUnreadMap, fetchMessages, setMessages, fetchConversations, getOrCreateDM } =
    useContext(ChatContext);

  const [openSections, setOpenSections] = useState({ directs: true, myGroups: true });
  const [isGroupModalOpen, setIsGroupModalOpen] = useState(false);

  const toggleSection = key => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  const directConversations = conversations.filter(c => !c.isGroup);
  const myGroups = conversations.filter(c => c.isGroup);

  const handleSelectConversation = async (conv) => {
    setActiveConversation(conv);
    onSelectConversation?.(conv);

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
    <div className="w-1/4 border-r bg-white p-4 flex flex-col">
      <h2 className="text-2xl font-bold mb-4 text-gray-700">Chats</h2>

      <UserSearch
        onSelect={(item) => {
           if (item.type === "group") {
            setActiveConversation(item);
          } else {
            getOrCreateDM(item._id);
          }
        }}
      />




      <div className="flex-1 overflow-y-auto space-y-4 mt-4">
        {/* Direct Messages */}
        <div>
          <ToggleButton label="Direct Messages" isOpen={openSections.directs} onToggle={() => toggleSection("directs")} />
          {openSections.directs && (
            <div className="ml-2">
              {directConversations.length ? directConversations.map((conv, idx) => {
                const { name, avatar } = getConversationDisplay(conv, user._id);
                return (
                  <div
                    key={conv._id || `dm-${idx}`}
                    onClick={() => handleSelectConversation(conv)}
                    className={`p-2 rounded cursor-pointer hover:bg-gray-100 flex items-center gap-2 ${activeConversation?._id === conv._id ? "bg-gray-200" : ""}`}
                  >
                    <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover" />
                    <span className="flex-1">{name}</span>
                    {unreadMap[conv._id] && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}
                  </div>
                );
              }) : <p className="text-gray-400 ml-2">No DMs yet</p>}
            </div>
          )}
        </div>

        {/* Groups */}
        <div>
          <ToggleButton label="Groups" isOpen={openSections.myGroups} onToggle={() => toggleSection("myGroups")} />
          {openSections.myGroups && (
            <div className="ml-2">
              {myGroups.length ? myGroups.map((conv, idx) => {
                const { name, avatar } = getConversationDisplay(conv, user._id);
                return (
                  <div
                    key={conv._id || `group-${idx}`}
                    onClick={() => handleSelectConversation(conv)}
                    className={`p-2 rounded cursor-pointer hover:bg-gray-100 flex items-center gap-2 ${activeConversation?._id === conv._id ? "bg-gray-200" : ""}`}
                  >
                    <img src={avatar} alt={name} className="w-8 h-8 rounded-full object-cover" />
                    <span className="flex-1">{name}</span>
                    {unreadMap[conv._id] && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}
                  </div>
                );
              }) : <p className="text-gray-400 ml-2">No groups yet</p>}
            </div>
          )}
        </div>
      </div>

      <button onClick={() => setIsGroupModalOpen(true)} className="mt-4 px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600">
        + Create Group
      </button>

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
