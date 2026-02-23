// src/components/MessageBubble.jsx
import React, { useContext, useState, useRef, useEffect } from "react";
// import { AuthContext } from "../context/AuthContext";
import dayjs from "dayjs";
import { ChatContext } from "../context/ChatContext";

const MessageBubble = ({ message, isGroup }) => {
  // const { user } = useContext(AuthContext);
  const { user, deleteMessage } = useContext(ChatContext);

  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [showReadBy, setShowReadBy] = useState(false);

  const menuRef = useRef(null);

  if (!message) return null;

  const sender = message.sender || {};
  const senderId = sender._id || message.senderId;
  const isOwn = senderId === user?._id;
  const messageText = message.content || message.message || "";

  const handleDelete = () => {
    if (!message._id) return;
    deleteMessage(message._id);
  };

  const handlePreview = (url) => {
    setPreviewUrl(url);
    setShowPreview(true);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const filteredReadBy =
    message.readBy?.filter(
      (u) => u._id?.toString() !== senderId?.toString()
    ) || [];


  return (
    <div className={`flex w-full mb-2 ${isOwn ? "justify-end" : "justify-start"}`}>
      <div className="flex flex-col relative min-w-[50px]">
        {!isOwn && sender.name && (
          <p className="text-xs font-semibold text-gray-600 mb-1">{sender.name}</p>
        )}

        <div
          className={`relative max-w-xs md:max-w-md px-3 py-2 rounded-lg shadow ${isOwn
            ? "bg-green-500 text-white rounded-br-none"
            : "bg-gray-200 text-black rounded-bl-none"
            }`}
        >
          {isOwn && (
            <div
              className="absolute top-1 right-1 cursor-pointer text-sm font-bold px-1 ml-2"
              onClick={() => setShowMenu(!showMenu)}
            >
              ⋮
            </div>
          )}

          {showMenu && isOwn && (
            <div
              ref={menuRef}
              className="absolute top-5 right-0 bg-white border rounded shadow z-50 text-sm"
            >
              {isGroup && (
                <button
                  className="block w-full text-left px-2 py-1 hover:bg-gray-100 text-black"
                  onClick={() => setShowReadBy(true)}
                >
                  View readBy
                </button>
              )}
              <button
                className="block w-full text-left px-2 py-1 hover:bg-gray-100 text-red-500"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          )}

          {/* Media rendering */}
          {message.mediaUrl && (
            <div className="mb-2">
              {message.mediaType === "image" && (
                <img
                  src={message.mediaUrl}
                  alt="attachment"
                  className="max-w-[200px] max-h-[200px] object-cover rounded-md cursor-pointer"
                  onClick={() => handlePreview(message.mediaUrl)}
                />
              )}
              {message.mediaType === "video" && (
                <video
                  controls
                  className="max-w-[200px] max-h-[200px] rounded-md cursor-pointer"
                  onClick={() => handlePreview(message.mediaUrl)}
                >
                  <source src={message.mediaUrl} />
                </video>
              )}
              {message.mediaType === "file" && (
                <div className="flex items-center gap-2 bg-gray-100 px-2 py-1 rounded-md shadow text-sm">
                  <span>📄</span>
                  {["pdf", "png", "jpg", "jpeg", "gif"].includes(
                    message.mediaUrl.split(".").pop().toLowerCase()
                  ) && (
                      <button
                        onClick={() => handlePreview(message.mediaUrl)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        Preview
                      </button>
                    )}
                  <span className="text-black">|</span>
                  <button
                    onClick={async () => {
                      try {
                        const res = await fetch(message.mediaUrl);
                        const blob = await res.blob();
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = message.fileName || "file";
                        document.body.appendChild(a);
                        a.click();
                        a.remove();
                        window.URL.revokeObjectURL(url);
                      } catch (err) {
                        console.error("Download failed:", err);
                      }
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    ⬇️
                  </button>
                </div>
              )}
            </div>
          )}

          {messageText && <p className="break-words mb-2">{messageText}</p>}

          {message.createdAt && (
            <span
              className={`absolute bottom-0.5 right-2 text-[10px] ${isOwn ? "text-white/70" : "text-gray-500"
                }`}
            >
              {dayjs(message.createdAt).format("h:mm A")}
            </span>
          )}
        </div>
      </div>

      {/* Media Preview Modal */}
      {showPreview && (
        <div
          className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          onClick={() => setShowPreview(false)}
        >
          {message.mediaType === "image" ? (
            <img src={previewUrl} alt="preview" className="min-w-[70vw] min-h-[80vh] rounded-lg" />
          ) : message.mediaType === "video" ? (
            <video controls className="min-w-[70vw] min-h-[80vh] rounded-lg">
              <source src={previewUrl} />
            </video>
          ) : (
            <iframe
              src={previewUrl}
              className="min-w-[60vw] min-h-[80vh] rounded-lg bg-white"
              title="file preview"
            />
          )}
        </div>
      )}

      {/* ReadBy Modal */}
      {showReadBy && isGroup && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowReadBy(false)}
        >
          <div
            className="bg-white p-4 rounded shadow max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold mb-2">Read by:</h3>
            {filteredReadBy.length ? (
              <ul className="list-disc pl-5 text-sm text-black">
                {filteredReadBy.map((u, idx) => (
                  <li key={u._id || u.email || idx}>
                    {u.name || u.email}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-black text-sm">No one else has read this yet</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;
