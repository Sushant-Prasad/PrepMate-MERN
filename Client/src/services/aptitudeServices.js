// src/services/aptitudeServices.js
import axios from "axios";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

/* ------------------------- Axios instance ------------------------- */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api/",
  withCredentials: false, // set true if you use httpOnly cookies
});
/* -------------------------- Query Keys ---------------------------- */
export const aptitudeKeys = {
  all: ["aptitude"],
  lists: () => [...aptitudeKeys.all, "list"],
  list: (filters) => [...aptitudeKeys.lists(), { filters }],
  detail: (id) => [...aptitudeKeys.all, "detail", id],
};

/* --------------------------- Helpers ------------------------------ */
const toQuery = (params = {}) => {
  const usp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") usp.append(k, v);
  });
  const q = usp.toString();
  return q ? `?${q}` : "";
};

/* --------------------------- Fetchers ----------------------------- */
// GET /api/aptitude?category=&subCategory=&company=
export const fetchAptiQuestions = async (filters = {}) => {
  const q = toQuery(filters);
  const { data } = await api.get(`/aptitude-questions/${q}`);
  return data; // { success, count, data: [...] }
};

// GET /api/aptitude/:id
export const fetchAptiQuestionById = async (id) => {
  const { data } = await api.get(`/aptitude-questions/${id}`);
  return data; // { success, data: {...} }
};

// POST /api/aptitude
export const createAptiQuestionApi = async (payload) => {
  const { data } = await api.post(`/aptitude-questions`, payload);
  return data; // { success, message, data }
};

// PUT /api/aptitude/:id
export const updateAptiQuestionApi = async ({ id, payload }) => {
  const { data } = await api.put(`/aptitude-questions/${id}`, payload);
  return data; // { success, message, data }
};

// DELETE /api/aptitude/:id
export const deleteAptiQuestionApi = async (id) => {
  const { data } = await api.delete(`/aptitude-questions/${id}`);
  return data; // { success, message }
};

/* ----------------------------- Hooks ------------------------------ */
// List with filters
export const useAptiQuestions = (filters = {}, options = {}) =>
  useQuery({
    queryKey: aptitudeKeys.list(filters),
    queryFn: () => fetchAptiQuestions(filters),
    keepPreviousData: true,
    staleTime: 60 * 1000,
    ...options,
  });

// Detail
export const useAptiQuestion = (id, options = {}) =>
  useQuery({
    queryKey: aptitudeKeys.detail(id),
    queryFn: () => fetchAptiQuestionById(id),
    enabled: !!id,
    ...options,
  });

// Create
export const useCreateAptiQuestion = (options = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createAptiQuestionApi,
    onSuccess: (res, vars) => {
      qc.invalidateQueries({ queryKey: aptitudeKeys.lists() });
      if (res?.data?._id) {
        qc.setQueryData(aptitudeKeys.detail(res.data._id), {
          success: true,
          data: res.data,
        });
      }
      options.onSuccess?.(res, vars);
    },
    ...options,
  });
};

// Update
export const useUpdateAptiQuestion = (options = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: updateAptiQuestionApi, // expects { id, payload }
    onSuccess: (res, vars) => {
      qc.invalidateQueries({ queryKey: aptitudeKeys.lists() });
      if (vars?.id) {
        qc.setQueryData(aptitudeKeys.detail(vars.id), res);
      }
      options.onSuccess?.(res, vars);
    },
    ...options,
  });
};

// Delete
export const useDeleteAptiQuestion = (options = {}) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: deleteAptiQuestionApi, // expects id
    onSuccess: (res, id) => {
      qc.invalidateQueries({ queryKey: aptitudeKeys.lists() });
      qc.removeQueries({ queryKey: aptitudeKeys.detail(id) });
      options.onSuccess?.(res, id);
    },
    ...options,
  });
};
