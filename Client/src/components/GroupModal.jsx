// src/components/GroupModal.jsx
import { useState } from "react";
import api from "../utils/api";
import UserSearch from "./UserSearch";

const GroupModal = ({ isOpen, onClose, onGroupCreated }) => {
  const [name, setName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || selectedUsers.length === 0) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append(
        "participants",
        JSON.stringify(selectedUsers.map((u) => u.email))
      );
      if (image) formData.append("groupImage", image);

      const res = await api.post("/create", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      if (typeof onGroupCreated === "function") {
        onGroupCreated(res.data.data);
      }

      setName("");
      setSelectedUsers([]);
      setImage(null);
      onClose();
    } catch (err) {
      console.error("Failed to create group:", err);
      alert(
        err.response?.data?.message ||
        "Failed to create group. Make sure participant emails are valid."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAddParticipant = (user) => {
    // Prevent duplicates
    setSelectedUsers((prev) =>
      prev.some((u) => u._id === user._id)
        ? prev
        : [...prev, user]
    );
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-[2px] p-3">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-[0_18px_44px_color-mix(in_srgb,var(--brand-secondary)_24%,transparent)]">
        <h2 className="mb-4 text-xl font-semibold tracking-tight text-[var(--brand-secondary)]">Create Group</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Group name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-input bg-background p-2.5 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)]"
            required
          />

          {/* 🔎 UserSearch Component */}
          <UserSearch
            mode="modal"
            onSelect={(user) => handleAddParticipant(user)}
          />


          {/* Show selected users */}
          {selectedUsers.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedUsers.map((u) => (
                <span
                  key={u._id}
                  className="flex items-center gap-1 rounded-full bg-[color:color-mix(in_srgb,var(--brand-primary)_20%,white)] px-2 py-1 text-sm text-[var(--brand-secondary)]"
                >
                  {u.email}
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedUsers((prev) =>
                        prev.filter((sel) => sel._id !== u._id)
                      )
                    }
                    className="text-red-500 ml-1"
                  >
                    ✕
                  </button>
                </span>
              ))}
            </div>
          )}

          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            className="w-full text-sm text-muted-foreground"
          />

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg bg-secondary px-4 py-2 text-secondary-foreground transition-opacity hover:opacity-90"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`rounded-lg bg-[var(--brand-primary)] px-4 py-2 font-semibold text-[var(--brand-secondary)] transition-all hover:bg-[var(--brand-secondary)] hover:text-white ${loading ? "cursor-not-allowed opacity-50" : ""
                }`}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GroupModal;
