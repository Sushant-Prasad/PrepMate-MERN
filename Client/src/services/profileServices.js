// src/services/profileServices.js

import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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
 */
export const fetchUserProfile = async (userId) => {

  if (!userId) throw new Error("userId is required");

  const { data } = await api.get(`/profiles/${encodeURIComponent(userId)}`);

  return data;

};


/**
 * POST /api/profiles/upload-photo
 */
export const uploadProfilePhoto = async (file) => {

  const formData = new FormData();
  formData.append("image", file);

  const { data } = await api.post(
    "/profiles/upload-photo",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;

};


/**
 * DELETE /api/profiles/delete-photo
 */
export const deleteProfilePhoto = async () => {

  const { data } = await api.delete("/profiles/delete-photo");

  return data;

};


/* ----------------------------- Hooks ------------------------------ */


/**
 * useUserProfile
 */
export const useUserProfile = (userId, options = {}) =>
  useQuery({
    queryKey: profileKeys.detail(userId),
    queryFn: () => fetchUserProfile(userId),
    enabled: !!userId,
    staleTime: 60 * 1000,
    ...options,
  });


/**
 * useUploadProfilePhoto
 */
export const useUploadProfilePhoto = () => {

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadProfilePhoto,

    onSuccess: () => {
      queryClient.invalidateQueries(profileKeys.all);
    },
  });

};


/**
 * useDeleteProfilePhoto
 */
export const useDeleteProfilePhoto = () => {

  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProfilePhoto,

    onSuccess: () => {
      queryClient.invalidateQueries(profileKeys.all);
    },
  });

};