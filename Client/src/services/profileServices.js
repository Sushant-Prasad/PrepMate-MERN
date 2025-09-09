// src/services/profileServices.js
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

/* ------------------------- Axios instance ------------------------- */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
  withCredentials: true,
  timeout: 15000,
});

/* -------------------------- Query Keys ---------------------------- */
export const profileKeys = {
  all: ["profile"],
  detail: (userId) => [...profileKeys.all, "detail", userId],
  me: () => [...profileKeys.all, "me"],
};

/* --------------------------- Fetchers ----------------------------- */

/**
 * GET /api/profiles/:userId
 * Returns: { success: true, data: { name, profileImage, dsaStreak, aptitudeStreak, recentActivity, joinedRooms } }
 */
export const fetchUserProfile = async (userId) => {
  if (!userId) throw new Error("userId is required");
  const { data } = await api.get(`/profiles/${encodeURIComponent(userId)}`);
  return data;
};
/* ----------------------------- Hooks ------------------------------ */

/**
 * useUserProfile
 * React Query hook to fetch a user's profile by id.
 * Example usage: const { data, isLoading } = useUserProfile(userId, { enabled: !!userId })
 */
export const useUserProfile = (userId, options = {}) =>
  useQuery({
    queryKey: profileKeys.detail(userId),
    queryFn: () => fetchUserProfile(userId),
    enabled: !!userId,
    staleTime: 60 * 1000,
    ...options,
  });


