// src/components/GroupModal.jsx
import { useState, useContext } from "react";
import api from "../utils/api";
import { ChatContext } from "../context/ChatContext";
import UserSearch from "./UserSearch";

const GroupModal = ({ isOpen, onClose, onGroupCreated }) => {
  const { user } = useContext(ChatContext);
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
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-96">
        <h2 className="text-xl font-semibold mb-4">Create Group</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            placeholder="Group name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />

          {/* 🔎 UserSearch Component */}
          <UserSearch
            mode="modal"
            onSelect={(user) => handleAddParticipant(user)}
          />


          {/* Show selected users */}
          {selectedUsers.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedUsers.map((u) => (
                <span
                  key={u._id}
                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-1"
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
            className="w-full"
          />

          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 rounded bg-blue-500 text-white hover:bg-blue-600 ${loading ? "opacity-50 cursor-not-allowed" : ""
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
