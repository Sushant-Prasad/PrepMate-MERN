import React, { useRef, useState } from "react";
import { Paperclip, Send, X } from "lucide-react"; // optional icons, can replace

export default function MessageInput({ value, onChange, onSend, onKeyPress, onSendMedia }) {
  const fileInputRef = useRef(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaFile, setMediaFile] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file)); // preview image/video
  };

  const handleSendClick = () => {
    if (mediaFile) {
      console.log("📂 Picked file:", mediaFile);

      onSendMedia(mediaFile, value); // send file + optional text
      setMediaFile(null);
      setMediaPreview(null);
      onChange("");
    } else {
      onSend();
    }
  };

  return (
    <div className="p-3 border-t bg-white flex items-center gap-2">
      {/* Hidden file input */}
      <input
        type="file"
        accept="image/*,video/*,.pdf,.doc,.docx,.zip"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Media Preview */}
      {mediaPreview && (
        <div className="relative">
          <img
            src={mediaPreview}
            alt="preview"
            className="w-20 h-20 object-cover rounded-md"
          />
          <button
            onClick={() => {
              setMediaFile(null);
              setMediaPreview(null);
            }}
            className="absolute top-0 right-0 bg-black/60 text-white rounded-full p-1"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Attach button */}
      <button
        onClick={() => fileInputRef.current.click()}
        className="p-2 text-gray-500 hover:text-gray-700"
      >
        <Paperclip size={20} />
      </button>

      {/* Text input */}
      <textarea
        className="flex-1 resize-none border rounded-lg px-3 py-2 focus:outline-none"
        rows={1}
        placeholder="Type a message"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyPress}
      />

      {/* Send button */}
      <button
        onClick={handleSendClick}
        className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
      >
        <Send size={20} />
      </button>
    </div>
  );
}
