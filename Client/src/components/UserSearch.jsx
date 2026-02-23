
import React, { useState, useContext, useEffect } from "react";
import { ChatContext } from "../context/ChatContext.jsx";
import api from "../utils/api";
import axios from "axios";

export default function UserSearch({ onSelect, mode = "sidebar" }) {
  const { user } = useContext(ChatContext);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const delayDebounce = setTimeout(() => {
      fetchResults(query);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const fetchResults = async (searchQuery) => {
    setLoading(true);
    try {
      if (mode === "sidebar") {
        const [userRes, groupRes] = await Promise.all([
          api.get(`/profiles/user/search?query=${searchQuery}`),
          api.get(`/group/search?query=${searchQuery}`)
        ]);

        const users = (userRes.data.data || []).map(u => ({
          ...u,
          type: "user"
        }));

        const groups = (groupRes.data.data || []).map(g => ({
          ...g,
          type: "group",
          isGroup: true
        }));

        setResults([...users, ...groups]);
      } else {
        // Group modal → users only
        const res = await api.get(`/profiles/user/search?query=${searchQuery}`);
        setResults(
          (res.data.data || []).map(u => ({
            ...u,
            type: "user"
          }))
        );
      }
    } catch (err) {
      console.error("Search failed:", err);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (item) => {
    if (!onSelect) return;        // 🛡️ SAFETY GUARD
    onSelect(item);
    setQuery("");                 // optional UX improvement
    setResults([]);
  };

  return (
    <div className="mb-4 relative">
      <input
        type="text"
        placeholder={mode === "sidebar" ? "Search users or groups..." : "Search users..."}
        className="w-full px-3 py-2 border rounded"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading && (
        <p className="text-sm text-gray-500 mt-1">Searching...</p>
      )}

      {results.length > 0 && (
        <div className="absolute z-20 mt-1 w-full max-h-64 overflow-y-auto border rounded bg-white shadow">
          {results.map((item) => (
            <div
              key={item._id}
              className="flex items-center gap-2 p-2 cursor-pointer hover:bg-gray-100"
              onClick={() => handleSelect(item)}
            >
              <img
                src={
                  item.type === "group"
                    ? item.groupImage || "/default-group.png"
                    : item.avatar || "/default-user.png"
                }
                alt={item.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex flex-col">
                <span className="text-gray-800">{item.name}</span>
                {item.type === "group" && (
                  <span className="text-xs text-gray-400">Group</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
