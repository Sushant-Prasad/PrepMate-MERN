import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/* ---------------- Axios instance ---------------- */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
  withCredentials: true,
  timeout: 15000,
});

/* ---------------- Query Keys ---------------- */
export const AUTH_KEYS = {
  allUsers: ["admin", "users"],
  user: (id) => ["admin", "user", id],
};

/* ---------------- Raw API calls ---------------- */

/**
 * GET /api/users
 * Admin only - returns list of users
 */
export const fetchAllUsersApi = async (params = {}) => {
  const { data } = await api.get("/users", { params });
  return data;
};

/**
 * GET /api/users/:id
 * Admin or self (exposed here for admin UI)
 */
export const fetchUserByIdApi = async (id) => {
  if (!id) throw new Error("id is required");
  const { data } = await api.get(`/users/${encodeURIComponent(id)}`);
  return data;
};

/**
 * PUT /api/users/:id
 * Update user fields (admin can update role etc.)
 * payload: { name?, email?, role?, ... }
 */
export const updateUserApi = async ({ id, payload }) => {
  if (!id) throw new Error("id is required");
  const { data } = await api.put(`/users/${encodeURIComponent(id)}`, payload);
  return data;
};

/**
 * DELETE /api/users/:id
 * Admin only
 */
export const deleteUserApi = async (id) => {
  if (!id) throw new Error("id is required");
  const { data } = await api.delete(`/users/${encodeURIComponent(id)}`);
  return data;
};

/* ---------------- React Query Hooks ---------------- */

/**
 * useFetchAllUsers
 * - params can include pagination or filters (if backend supports)
 */
export const useFetchAllUsers = (params = {}, options = {}) =>
  useQuery({
    queryKey: [...AUTH_KEYS.allUsers, params],
    queryFn: () => fetchAllUsersApi(params),
    keepPreviousData: true,
    staleTime: 60 * 1000,
    ...options,
  });

/** useFetchUserById */
export const useFetchUserById = (id, options = {}) =>
  useQuery({
    queryKey: AUTH_KEYS.user(id),
    queryFn: () => fetchUserByIdApi(id),
    enabled: !!id,
    staleTime: 60 * 1000,
    ...options,
  });

/** useUpdateUser (admin) */
export const useUpdateUser = (options = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateUserApi, // expects { id, payload }
    onSuccess: (res, vars) => {
      const id = vars?.id;
      qc.invalidateQueries({ queryKey: AUTH_KEYS.allUsers });
      if (id) qc.invalidateQueries({ queryKey: AUTH_KEYS.user(id) });
      options.onSuccess?.(res, vars);
    },
    onError: options.onError,
    ...options,
  });
};

/** useDeleteUser (admin) */
export const useDeleteUser = (options = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteUserApi, // expects id
    onSuccess: (res, id) => {
      // invalidate list and remove detail cache
      qc.invalidateQueries({ queryKey: AUTH_KEYS.allUsers });
      if (id) qc.removeQueries({ queryKey: AUTH_KEYS.user(id) });
      options.onSuccess?.(res, id);
    },
    onError: options.onError,
    ...options,
  });
};

/* ---------------- Export default---------------- */
const authServices = {
  api,
  fetchAllUsersApi,
  fetchUserByIdApi,
  updateUserApi,
  deleteUserApi,
  useFetchAllUsers,
  useFetchUserById,
  useUpdateUser,
  useDeleteUser,
};

export default authServices;
