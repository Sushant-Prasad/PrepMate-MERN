// src/pages/Chat.jsx
import React, { useContext } from "react";
import { ChatContext } from "../context/ChatContext.jsx";
import ChatSidebar from "../components/ChatSidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import GroupInfo from "../components/GroupInfo.jsx"

export default function Chat() {
  const { setActiveConversation, showGroupInfo } = useContext(ChatContext);

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <ChatSidebar onSelectConversation={setActiveConversation} />

      {/* Chat Window */}
      {showGroupInfo ? <GroupInfo /> : <ChatWindow />}

    </div>
  );
}
