// src/services/DSAServices.js
// Axios + React Query service layer for DSA Questions

import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

/** ---------------- Axios Instance ---------------- */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api", 
  withCredentials: true, // ✅ send HttpOnly cookies (JWT)
});

/** ---------------- Query Keys ---------------- */
export const DSA_KEYS = {
  all: ["dsa-questions"],
  list: (filters = {}) => ["dsa-questions", "list", filters],
  detail: (id) => ["dsa-questions", "detail", id],
  byTag: (tag) => ["dsa-questions", "tag", tag?.toLowerCase()],
  byCompany: (companyTag) => ["dsa-questions", "company", companyTag?.toLowerCase()],
  byDifficulty: (level) => ["dsa-questions", "difficulty", level?.toLowerCase()],
};

/** ---------------- API Calls (raw) ---------------- */
export const getAllDSAApi = async (params = {}) => {
  const { data } = await api.get("/dsa-questions", { params });
  return data;
};

export const getDSAByIdApi = async (id) => {
  const { data } = await api.get(`/dsa-questions/${id}`);
  return data;
};

export const getDSAByTagApi = async (tag) => {
  const { data } = await api.get(`/dsa-questions/tag/${encodeURIComponent(tag)}`);
  return data;
};

export const getDSAByCompanyTagApi = async (companyTag) => {
  const { data } = await api.get(`/dsa-questions/company/${encodeURIComponent(companyTag)}`);
  return data;
};

export const getDSAByDifficultyApi = async (level) => {
  const { data } = await api.get(`/dsa-questions/difficulty/${encodeURIComponent(level)}`);
  return data;
};

// Protected (Admin only)
export const createDSAApi = async (payload) => {
  const { data } = await api.post("/dsa-questions", payload);
  return data;
};

export const updateDSAApi = async ({ id, updates }) => {
  const { data } = await api.put(`/dsa-questions/${id}`, updates);
  return data;
};

export const deleteDSAApi = async (id) => {
  const { data } = await api.delete(`/dsa-questions/${id}`);
  return data;
};

/** ---------------- React Query Hooks ---------------- */
export const useDSAQuestions = (params = {}, options = {}) =>
  useQuery({
    queryKey: DSA_KEYS.list(params),
    queryFn: () => getAllDSAApi(params),
    ...options,
  });

export const useDSAQuestion = (id, options = {}) =>
  useQuery({
    queryKey: DSA_KEYS.detail(id),
    queryFn: () => getDSAByIdApi(id),
    enabled: !!id,
    ...options,
  });

export const useDSAByTag = (tag, options = {}) =>
  useQuery({
    queryKey: DSA_KEYS.byTag(tag),
    queryFn: () => getDSAByTagApi(tag),
    enabled: !!tag,
    ...options,
  });

export const useDSAByCompanyTag = (companyTag, options = {}) =>
  useQuery({
    queryKey: DSA_KEYS.byCompany(companyTag),
    queryFn: () => getDSAByCompanyTagApi(companyTag),
    enabled: !!companyTag,
    ...options,
  });

export const useDSAByDifficulty = (level, options = {}) =>
  useQuery({
    queryKey: DSA_KEYS.byDifficulty(level),
    queryFn: () => getDSAByDifficultyApi(level),
    enabled: !!level,
    ...options,
  });

/** ---------------- Mutations ---------------- */
export const useCreateDSA = (options = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createDSAApi,
    onSuccess: (data, variables, ctx) => {
      qc.invalidateQueries({ queryKey: DSA_KEYS.all });
      options.onSuccess?.(data, variables, ctx);
    },
    ...options,
  });
};

export const useUpdateDSA = (options = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateDSAApi,
    onSuccess: (data, variables, ctx) => {
      const { id } = variables || {};
      if (id) qc.invalidateQueries({ queryKey: DSA_KEYS.detail(id) });
      qc.invalidateQueries({ queryKey: DSA_KEYS.all });
      options.onSuccess?.(data, variables, ctx);
    },
    ...options,
  });
};

export const useDeleteDSA = (options = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteDSAApi,
    onSuccess: (data, id, ctx) => {
      qc.invalidateQueries({ queryKey: DSA_KEYS.all });
      options.onSuccess?.(data, id, ctx);
    },
    ...options,
  });
};
