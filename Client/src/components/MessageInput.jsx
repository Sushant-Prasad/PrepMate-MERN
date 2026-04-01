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
    <div className="flex items-end gap-2 border-t border-border bg-card/95 p-3 backdrop-blur-sm">
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
        <div className="relative rounded-xl border border-[color:color-mix(in_srgb,var(--brand-primary)_35%,white)] bg-background p-1 shadow-sm">
          {mediaFile?.type?.startsWith("image/") ? (
            <img
              src={mediaPreview}
              alt="preview"
              className="w-20 h-20 object-cover rounded-md border border-border"
            />
          ) : (
            <div className="w-20 h-20 rounded-md border border-border bg-muted flex items-center justify-center text-xs text-muted-foreground px-1 text-center">
              {mediaFile?.name || "Attachment"}
            </div>
          )}
          <button
            onClick={() => {
              setMediaFile(null);
              setMediaPreview(null);
            }}
            className="absolute -right-2 -top-2 rounded-full bg-[var(--brand-secondary)] p-1 text-white shadow"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Attach button */}
      <button
        onClick={() => fileInputRef.current.click()}
        className="rounded-full p-2 text-[var(--brand-secondary)] transition-colors hover:bg-[color:color-mix(in_srgb,var(--brand-primary)_18%,white)]"
      >
        <Paperclip size={20} />
      </button>

      {/* Text input */}
      <textarea
        className="max-h-28 flex-1 resize-none rounded-xl border border-input bg-background px-3 py-2 leading-relaxed shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
        rows={1}
        placeholder="Type a message"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyPress}
      />

      {/* Send button */}
      <button
        onClick={handleSendClick}
        className="rounded-full bg-[var(--brand-primary)] p-2 text-[var(--brand-secondary)] transition-all hover:-translate-y-0.5 hover:bg-[var(--brand-secondary)] hover:text-white hover:shadow-md"
      >
        <Send size={20} />
      </button>
    </div>
  );
}
