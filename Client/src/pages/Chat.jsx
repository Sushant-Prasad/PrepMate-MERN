// src/pages/Chat.jsx
import React, { useContext } from "react";
import { ChatContext } from "../context/ChatContext.jsx";
import ChatSidebar from "../components/ChatSidebar.jsx";
import ChatWindow from "../components/ChatWindow.jsx";
import GroupInfo from "../components/GroupInfo.jsx"

export default function Chat() {
  const { setActiveConversation, activeConversation, showGroupInfo } = useContext(ChatContext);

  const showDetailPane = Boolean(activeConversation) || showGroupInfo;

  return (
    <div className="h-screen overflow-hidden bg-[linear-gradient(145deg,color-mix(in_srgb,var(--brand-primary)_12%,white),white_45%,color-mix(in_srgb,var(--brand-secondary)_10%,white))] p-2 sm:p-4">
      <div className="relative flex h-full overflow-hidden rounded-2xl border border-border bg-card/90 shadow-[0_18px_44px_color-mix(in_srgb,var(--brand-secondary)_18%,transparent)] backdrop-blur-sm">
        <div className="pointer-events-none absolute -top-16 -left-16 h-52 w-52 rounded-full bg-[color:color-mix(in_srgb,var(--brand-primary)_35%,white)] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 -right-16 h-52 w-52 rounded-full bg-[color:color-mix(in_srgb,var(--brand-secondary)_22%,white)] blur-3xl" />
        <div className={`${showDetailPane ? "hidden md:flex" : "flex"} h-full w-full md:w-[340px] md:shrink-0`}>
          <ChatSidebar onSelectConversation={setActiveConversation} />
        </div>

        <div className={`${showDetailPane ? "flex" : "hidden md:flex"} min-w-0 flex-1`}>
          {showGroupInfo ? <GroupInfo /> : <ChatWindow />}
        </div>
      </div>
    </div>
  );
}
