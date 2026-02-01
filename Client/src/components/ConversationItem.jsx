// src/components/ConversationItem.jsx
import { useContext } from "react";
import { ChatContext } from "../context/ChatContext";

const ConversationItem = ({ conversation, currentUserId }) => {
  const { activeConversation, setActiveConversation } = useContext(ChatContext);

  const isActive = activeConversation?._id === conversation._id;

  const displayName = conversation.isGroup
    ? conversation.name
    : conversation.participants.find((p) => p._id !== currentUserId)?.name || "Unknown";

  return (
    <div
      className={`p-3 cursor-pointer border-b hover:bg-gray-100 ${
        isActive ? "bg-gray-200 font-semibold" : ""
      }`}
      onClick={() => setActiveConversation(conversation)}
    >
      {displayName}
    </div>
  );
};

export default ConversationItem;
